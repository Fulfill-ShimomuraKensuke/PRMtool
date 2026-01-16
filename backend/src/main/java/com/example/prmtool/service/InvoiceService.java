package com.example.prmtool.service;

import com.example.prmtool.dto.InvoiceRequest;
import com.example.prmtool.dto.InvoiceResponse;
import com.example.prmtool.entity.Commission;
import com.example.prmtool.entity.Invoice;
import com.example.prmtool.entity.InvoiceItem;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.repository.CommissionRepository;
import com.example.prmtool.repository.InvoiceRepository;
import com.example.prmtool.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

  private final InvoiceRepository invoiceRepository;
  private final PartnerRepository partnerRepository;
  private final CommissionRepository commissionRepository;

  // 消費税率（10%）
  private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0.10);

  // 請求書一覧を取得
  @Transactional(readOnly = true)
  public List<InvoiceResponse> getAllInvoices() {
    return invoiceRepository.findAll().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // 請求書IDで取得
  @Transactional(readOnly = true)
  public InvoiceResponse getInvoiceById(UUID id) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません"));
    return convertToResponse(invoice);
  }

  // パートナーIDで請求書を取得
  @Transactional(readOnly = true)
  public List<InvoiceResponse> getInvoicesByPartnerId(UUID partnerId) {
    return invoiceRepository.findByPartnerId(partnerId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // ステータスで請求書を取得
  @Transactional(readOnly = true)
  public List<InvoiceResponse> getInvoicesByStatus(Invoice.InvoiceStatus status) {
    return invoiceRepository.findByStatus(status).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // 請求書を作成
  @Transactional
  public InvoiceResponse createInvoice(InvoiceRequest request) {
    // パートナーを取得
    Partner partner = partnerRepository.findById(request.getPartnerId())
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません"));

    // 請求書番号を生成（例: INV-2026-0001）
    String invoiceNumber = generateInvoiceNumber();

    // 請求書エンティティを作成
    Invoice invoice = Invoice.builder()
        .invoiceNumber(invoiceNumber)
        .partner(partner)
        .issueDate(request.getIssueDate())
        .dueDate(request.getDueDate())
        .status(request.getStatus())
        .notes(request.getNotes())
        .build();

    // 明細を追加し、金額を計算
    BigDecimal subtotal = BigDecimal.ZERO;
    for (InvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
      // 手数料を取得（任意）
      Commission commission = null;
      if (itemRequest.getCommissionId() != null) {
        commission = commissionRepository.findById(itemRequest.getCommissionId())
            .orElse(null);
      }

      // 明細の金額を計算
      BigDecimal amount = itemRequest.getUnitPrice()
          .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

      // 明細を作成
      InvoiceItem item = InvoiceItem.builder()
          .commission(commission)
          .description(itemRequest.getDescription())
          .quantity(itemRequest.getQuantity())
          .unitPrice(itemRequest.getUnitPrice())
          .amount(amount)
          .build();

      invoice.addItem(item);
      subtotal = subtotal.add(amount);
    }

    // 税額と合計金額を計算
    BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP);
    BigDecimal totalAmount = subtotal.add(taxAmount);

    invoice.setSubtotal(subtotal);
    invoice.setTaxAmount(taxAmount);
    invoice.setTotalAmount(totalAmount);

    Invoice saved = invoiceRepository.save(invoice);
    return convertToResponse(saved);
  }

  // 請求書を更新
  @Transactional
  public InvoiceResponse updateInvoice(UUID id, InvoiceRequest request) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません"));

    // パートナーを取得
    Partner partner = partnerRepository.findById(request.getPartnerId())
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません"));

    // 基本情報を更新
    invoice.setPartner(partner);
    invoice.setIssueDate(request.getIssueDate());
    invoice.setDueDate(request.getDueDate());
    invoice.setStatus(request.getStatus());
    invoice.setNotes(request.getNotes());

    // 既存の明細をクリア
    invoice.getItems().clear();

    // 明細を再追加し、金額を再計算
    BigDecimal subtotal = BigDecimal.ZERO;
    for (InvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
      Commission commission = null;
      if (itemRequest.getCommissionId() != null) {
        commission = commissionRepository.findById(itemRequest.getCommissionId())
            .orElse(null);
      }

      BigDecimal amount = itemRequest.getUnitPrice()
          .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

      InvoiceItem item = InvoiceItem.builder()
          .commission(commission)
          .description(itemRequest.getDescription())
          .quantity(itemRequest.getQuantity())
          .unitPrice(itemRequest.getUnitPrice())
          .amount(amount)
          .build();

      invoice.addItem(item);
      subtotal = subtotal.add(amount);
    }

    // 税額と合計金額を再計算
    BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP);
    BigDecimal totalAmount = subtotal.add(taxAmount);

    invoice.setSubtotal(subtotal);
    invoice.setTaxAmount(taxAmount);
    invoice.setTotalAmount(totalAmount);

    Invoice updated = invoiceRepository.save(invoice);
    return convertToResponse(updated);
  }

  // 請求書を削除
  @Transactional
  public void deleteInvoice(UUID id) {
    if (!invoiceRepository.existsById(id)) {
      throw new RuntimeException("請求書が見つかりません");
    }
    invoiceRepository.deleteById(id);
  }

  // パートナーIDで請求書の合計金額を取得
  @Transactional(readOnly = true)
  public BigDecimal getTotalInvoiceAmountByPartnerId(UUID partnerId) {
    return invoiceRepository.sumTotalAmountByPartnerId(partnerId);
  }

  // 請求書番号を生成（例: INV-2026-0001）
  private String generateInvoiceNumber() {
    String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
    String latestNumber = invoiceRepository.findLatestInvoiceNumber().orElse(null);

    int nextNumber = 1;
    if (latestNumber != null && latestNumber.startsWith("INV-" + year)) {
      // 最新の番号から次の番号を生成
      String numberPart = latestNumber.substring(latestNumber.lastIndexOf('-') + 1);
      try {
        nextNumber = Integer.parseInt(numberPart) + 1;
      } catch (NumberFormatException e) {
        nextNumber = 1;
      }
    }

    return String.format("INV-%s-%04d", year, nextNumber);
  }

  // エンティティをレスポンスDTOに変換
  private InvoiceResponse convertToResponse(Invoice invoice) {
    List<InvoiceResponse.InvoiceItemResponse> items = invoice.getItems().stream()
        .map(item -> InvoiceResponse.InvoiceItemResponse.builder()
            .id(item.getId())
            .commissionId(item.getCommission() != null ? item.getCommission().getId() : null)
            .description(item.getDescription())
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .amount(item.getAmount())
            .createdAt(item.getCreatedAt())
            .build())
        .collect(Collectors.toList());

    return InvoiceResponse.builder()
        .id(invoice.getId())
        .invoiceNumber(invoice.getInvoiceNumber())
        .partnerId(invoice.getPartner().getId())
        .partnerName(invoice.getPartner().getName())
        .issueDate(invoice.getIssueDate())
        .dueDate(invoice.getDueDate())
        .subtotal(invoice.getSubtotal())
        .taxAmount(invoice.getTaxAmount())
        .totalAmount(invoice.getTotalAmount())
        .status(invoice.getStatus())
        .statusLabel(InvoiceResponse.getStatusLabel(invoice.getStatus()))
        .notes(invoice.getNotes())
        .items(items)
        .createdAt(invoice.getCreatedAt())
        .updatedAt(invoice.getUpdatedAt())
        .build();
  }
}
