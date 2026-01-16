package com.example.prmtool.controller;

import com.example.prmtool.dto.InvoiceRequest;
import com.example.prmtool.dto.InvoiceResponse;
import com.example.prmtool.entity.Invoice;
import com.example.prmtool.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class InvoiceController {

  private final InvoiceService invoiceService;

  // 請求書一覧を取得
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
    List<InvoiceResponse> invoices = invoiceService.getAllInvoices();
    return ResponseEntity.ok(invoices);
  }

  // 請求書IDで取得
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
    InvoiceResponse invoice = invoiceService.getInvoiceById(id);
    return ResponseEntity.ok(invoice);
  }

  // パートナーIDで請求書を取得
  @GetMapping("/partner/{partnerId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getInvoicesByPartnerId(@PathVariable UUID partnerId) {
    List<InvoiceResponse> invoices = invoiceService.getInvoicesByPartnerId(partnerId);
    return ResponseEntity.ok(invoices);
  }

  // ステータスで請求書を取得
  @GetMapping("/status/{status}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getInvoicesByStatus(@PathVariable Invoice.InvoiceStatus status) {
    List<InvoiceResponse> invoices = invoiceService.getInvoicesByStatus(status);
    return ResponseEntity.ok(invoices);
  }

  // 請求書を作成
  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
    InvoiceResponse created = invoiceService.createInvoice(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // 請求書を更新
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InvoiceResponse> updateInvoice(
      @PathVariable UUID id,
      @Valid @RequestBody InvoiceRequest request) {
    InvoiceResponse updated = invoiceService.updateInvoice(id, request);
    return ResponseEntity.ok(updated);
  }

  // 請求書を削除
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
    invoiceService.deleteInvoice(id);
    return ResponseEntity.noContent().build();
  }

  // パートナーIDで請求書の合計金額を取得
  @GetMapping("/partner/{partnerId}/total")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<BigDecimal> getTotalInvoiceAmountByPartnerId(@PathVariable UUID partnerId) {
    BigDecimal total = invoiceService.getTotalInvoiceAmountByPartnerId(partnerId);
    return ResponseEntity.ok(total);
  }
}
