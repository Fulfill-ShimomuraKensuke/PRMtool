package com.example.prmtool.service;

import com.example.prmtool.dto.InvoiceRequest;
import com.example.prmtool.dto.InvoiceResponse;
import com.example.prmtool.entity.*;
import com.example.prmtool.repository.*;
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

/**
 * 請求書サービス
 * 「確定結果」を作成・管理。後で再計算はしない。
 */
@Service
@RequiredArgsConstructor
public class InvoiceService {

  private final InvoiceRepository invoiceRepository;
  private final PartnerRepository partnerRepository;
  private final CommissionRuleRepository commissionRuleRepository;
  private final CommissionCalculationService commissionCalculationService;

  // 現在の消費税率
  private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("0.10");

  /**
   * 全請求書を取得
   */
  @Transactional(readOnly = true)
  public List<InvoiceResponse> getAllInvoices() {
    return invoiceRepository.findAll().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * IDで請求書を取得
   */
  @Transactional(readOnly = true)
  public InvoiceResponse getInvoiceById(UUID id) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません: " + id));
    return convertToResponse(invoice);
  }

  /**
   * パートナーIDで請求書を取得
   */
  @Transactional(readOnly = true)
  public List<InvoiceResponse> getInvoicesByPartnerId(UUID partnerId) {
    return invoiceRepository.findByPartnerId(partnerId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 請求書を作成
   * 手数料ルールの内容をコピーして確定結果を保存
   */
  @Transactional
  public InvoiceResponse createInvoice(InvoiceRequest request) {
    // バリデーション処理
    if (request.getItems() == null || request.getItems().isEmpty()) {
      throw new IllegalArgumentException("請求書には最低1件の明細が必要です");
    }

    // パートナーを取得
    Partner partner = partnerRepository.findById(request.getPartnerId())
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + request.getPartnerId()));

    // 請求書番号を生成
    String invoiceNumber = generateInvoiceNumber();

    // 請求書エンティティを作成
    Invoice invoice = Invoice.builder()
        .invoiceNumber(invoiceNumber)
        .partner(partner)
        .issueDate(request.getIssueDate())
        .dueDate(request.getDueDate())
        .taxCategory(request.getTaxCategory())
        .taxRate(DEFAULT_TAX_RATE)
        .status(request.getStatus())
        .notes(request.getNotes())
        .build();

    // 明細を追加し、金額を計算
    BigDecimal subtotal = BigDecimal.ZERO;
    BigDecimal commissionSubtotal = BigDecimal.ZERO;

    for (InvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
      // 手数料ルールを取得（任意）
      CommissionRule rule = null;
      if (itemRequest.getCommissionRuleId() != null) {
        rule = commissionRuleRepository.findById(itemRequest.getCommissionRuleId())
            .orElseThrow(() -> new RuntimeException(
                "手数料ルールが見つかりません: " + itemRequest.getCommissionRuleId()));

        // 手数料ルールが「確定」状態かチェック
        if (!rule.isUsableForInvoice()) {
          throw new IllegalStateException(
              "手数料ルール「" + rule.getRuleName() + "」は確定状態ではありません。ステータス: " + rule.getStatus());
        }
      }

      // 商品金額を計算
      BigDecimal productAmount = itemRequest.getUnitPrice()
          .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
          .setScale(2, RoundingMode.HALF_UP);

      // 手数料を計算
      BigDecimal commissionAmount = BigDecimal.ZERO;
      if (rule != null) {
        commissionAmount = commissionCalculationService.calculateCommission(
            rule,
            productAmount,
            itemRequest.getQuantity());
      }

      // 明細合計
      BigDecimal itemTotal = productAmount.add(commissionAmount);

      // 明細を作成（手数料ルールの内容をコピー）
      InvoiceItem item = InvoiceItem.builder()
          .appliedCommissionRule(rule)
          .description(itemRequest.getDescription())
          .quantity(itemRequest.getQuantity())
          .unitPrice(itemRequest.getUnitPrice())
          .productAmount(productAmount)
          // 手数料ルールをコピーして保持
          .appliedCommissionType(rule != null ? rule.getCommissionType() : null)
          .appliedRatePercent(rule != null ? rule.getRatePercent() : null)
          .appliedFixedAmount(rule != null ? rule.getFixedAmount() : null)
          .commissionAmount(commissionAmount)
          .itemTotal(itemTotal)
          .build();

      invoice.addItem(item);

      // 小計に加算
      subtotal = subtotal.add(productAmount);
      commissionSubtotal = commissionSubtotal.add(commissionAmount);
    }

    // 消費税と合計を計算
    calculateTaxAndTotal(invoice, subtotal, commissionSubtotal);

    // 保存
    Invoice saved = invoiceRepository.save(invoice);
    return convertToResponse(saved);
  }

  /**
   * 請求書を更新
   * 注意: 発行済・支払済の請求書は更新できない
   */
  @Transactional
  public InvoiceResponse updateInvoice(UUID id, InvoiceRequest request) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません: " + id));

    // 発行済・支払済の場合は更新不可
    if (invoice.getStatus() == Invoice.InvoiceStatus.ISSUED ||
        invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
      throw new IllegalStateException("発行済・支払済の請求書は更新できません");
    }

    // パートナーを取得
    Partner partner = partnerRepository.findById(request.getPartnerId())
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + request.getPartnerId()));

    // 基本情報を更新
    invoice.setPartner(partner);
    invoice.setIssueDate(request.getIssueDate());
    invoice.setDueDate(request.getDueDate());
    invoice.setTaxCategory(request.getTaxCategory());
    invoice.setStatus(request.getStatus());
    invoice.setNotes(request.getNotes());

    // 既存の明細をクリア
    invoice.getItems().clear();

    // 明細を再追加し、金額を再計算
    BigDecimal subtotal = BigDecimal.ZERO;
    BigDecimal commissionSubtotal = BigDecimal.ZERO;

    for (InvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
      CommissionRule rule = null;
      if (itemRequest.getCommissionRuleId() != null) {
        rule = commissionRuleRepository.findById(itemRequest.getCommissionRuleId())
            .orElseThrow(() -> new RuntimeException(
                "手数料ルールが見つかりません: " + itemRequest.getCommissionRuleId()));

        if (!rule.isUsableForInvoice()) {
          throw new IllegalStateException(
              "手数料ルール「" + rule.getRuleName() + "」は確定状態ではありません");
        }
      }

      BigDecimal productAmount = itemRequest.getUnitPrice()
          .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
          .setScale(2, RoundingMode.HALF_UP);

      BigDecimal commissionAmount = BigDecimal.ZERO;
      if (rule != null) {
        commissionAmount = commissionCalculationService.calculateCommission(
            rule,
            productAmount,
            itemRequest.getQuantity());
      }

      BigDecimal itemTotal = productAmount.add(commissionAmount);

      InvoiceItem item = InvoiceItem.builder()
          .appliedCommissionRule(rule)
          .description(itemRequest.getDescription())
          .quantity(itemRequest.getQuantity())
          .unitPrice(itemRequest.getUnitPrice())
          .productAmount(productAmount)
          .appliedCommissionType(rule != null ? rule.getCommissionType() : null)
          .appliedRatePercent(rule != null ? rule.getRatePercent() : null)
          .appliedFixedAmount(rule != null ? rule.getFixedAmount() : null)
          .commissionAmount(commissionAmount)
          .itemTotal(itemTotal)
          .build();

      invoice.addItem(item);

      subtotal = subtotal.add(productAmount);
      commissionSubtotal = commissionSubtotal.add(commissionAmount);
    }

    // 消費税と合計を再計算
    calculateTaxAndTotal(invoice, subtotal, commissionSubtotal);

    Invoice updated = invoiceRepository.save(invoice);
    return convertToResponse(updated);
  }

  /**
   * 請求書を削除
   */
  @Transactional
  public void deleteInvoice(UUID id) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません: " + id));

    // 発行済・支払済の場合は削除不可
    if (invoice.getStatus() == Invoice.InvoiceStatus.ISSUED ||
        invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
      throw new IllegalStateException("発行済・支払済の請求書は削除できません");
    }

    invoiceRepository.deleteById(id);
  }

  /**
   * ステータスを変更
   */
  @Transactional
  public InvoiceResponse updateStatus(UUID id, Invoice.InvoiceStatus newStatus) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません: " + id));

    invoice.setStatus(newStatus);
    Invoice updated = invoiceRepository.save(invoice);
    return convertToResponse(updated);
  }

  /**
   * 消費税と合計金額を計算
   * 消費税区分に応じて課税対象額を決定
   */
  private void calculateTaxAndTotal(
      Invoice invoice,
      BigDecimal subtotal,
      BigDecimal commissionSubtotal) {

    BigDecimal taxableAmount;
    BigDecimal taxAmount;

    switch (invoice.getTaxCategory()) {
      case TAX_INCLUDED:
        // 商品＋手数料に課税
        taxableAmount = subtotal.add(commissionSubtotal);
        taxAmount = taxableAmount
            .multiply(invoice.getTaxRate())
            .setScale(0, RoundingMode.HALF_UP);
        break;

      case TAX_ON_PRODUCT_ONLY:
        // 商品部分のみ課税
        taxableAmount = subtotal;
        taxAmount = taxableAmount
            .multiply(invoice.getTaxRate())
            .setScale(0, RoundingMode.HALF_UP);
        break;

      case TAX_EXEMPT:
        // 非課税
        taxableAmount = BigDecimal.ZERO;
        taxAmount = BigDecimal.ZERO;
        break;

      default:
        throw new IllegalArgumentException("未対応の消費税区分: " + invoice.getTaxCategory());
    }

    // 合計金額を計算
    BigDecimal totalAmount = subtotal
        .add(commissionSubtotal)
        .add(taxAmount);

    // 請求書に設定
    invoice.setSubtotal(subtotal);
    invoice.setCommissionSubtotal(commissionSubtotal);
    invoice.setTaxableAmount(taxableAmount);
    invoice.setTaxAmount(taxAmount);
    invoice.setTotalAmount(totalAmount);
  }

  /**
   * 請求書番号を生成
   */
  private String generateInvoiceNumber() {
    String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
    String latestNumber = invoiceRepository.findLatestInvoiceNumber().orElse(null);

    int nextNumber = 1;
    if (latestNumber != null && latestNumber.startsWith("INV-" + year)) {
      String numberPart = latestNumber.substring(latestNumber.lastIndexOf('-') + 1);
      try {
        nextNumber = Integer.parseInt(numberPart) + 1;
      } catch (NumberFormatException e) {
        nextNumber = 1;
      }
    }

    return String.format("INV-%s-%04d", year, nextNumber);
  }

  /**
   * エンティティをレスポンスDTOに変換
   */
  private InvoiceResponse convertToResponse(Invoice invoice) {
    List<InvoiceResponse.InvoiceItemResponse> items = invoice.getItems().stream()
        .map(item -> InvoiceResponse.InvoiceItemResponse.builder()
            .id(item.getId())
            .commissionRuleId(item.getAppliedCommissionRule() != null ? item.getAppliedCommissionRule().getId() : null)
            .commissionRuleName(
                item.getAppliedCommissionRule() != null ? item.getAppliedCommissionRule().getRuleName() : null)
            .description(item.getDescription())
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .productAmount(item.getProductAmount())
            .appliedCommissionType(item.getAppliedCommissionType())
            .appliedRatePercent(item.getAppliedRatePercent())
            .appliedFixedAmount(item.getAppliedFixedAmount())
            .commissionAmount(item.getCommissionAmount())
            .itemTotal(item.getItemTotal())
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
        .taxCategory(invoice.getTaxCategory())
        .taxRate(invoice.getTaxRate())
        .subtotal(invoice.getSubtotal())
        .commissionSubtotal(invoice.getCommissionSubtotal())
        .taxableAmount(invoice.getTaxableAmount())
        .taxAmount(invoice.getTaxAmount())
        .totalAmount(invoice.getTotalAmount())
        .status(invoice.getStatus())
        .notes(invoice.getNotes())
        .items(items)
        .createdAt(invoice.getCreatedAt())
        .updatedAt(invoice.getUpdatedAt())
        .build();
  }

  /**
   * 請求書を「支払済」に変更する専用メソッド
   * 発行済(ISSUED)状態の請求書のみ支払済(PAID)に変更可能
   * 
   * @param id 請求書ID
   * @return 更新後の請求書レスポンス
   * @throws RuntimeException      請求書が見つからない場合
   * @throws IllegalStateException 発行済以外の状態の場合
   */
  @Transactional
  public InvoiceResponse markAsPaid(UUID id) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません: " + id));

    // 発行済状態のみ支払済に変更可能
    if (invoice.getStatus() != Invoice.InvoiceStatus.ISSUED) {
      throw new IllegalStateException(
          "発行済の請求書のみ支払済に変更できます。現在のステータス: " + invoice.getStatus());
    }

    invoice.setStatus(Invoice.InvoiceStatus.PAID);
    Invoice updated = invoiceRepository.save(invoice);
    return convertToResponse(updated);
  }
}
