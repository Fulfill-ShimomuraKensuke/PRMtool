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

import java.util.List;
import java.util.UUID;

/**
 * 請求書Controller
 * ACCOUNTING権限を追加：作成・編集・ステータス変更が可能（削除は不可）
 */
@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InvoiceController {

  private final InvoiceService invoiceService;

  /**
   * 全請求書を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
    List<InvoiceResponse> invoices = invoiceService.getAllInvoices();
    return ResponseEntity.ok(invoices);
  }

  /**
   * IDで請求書を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
    InvoiceResponse invoice = invoiceService.getInvoiceById(id);
    return ResponseEntity.ok(invoice);
  }

  /**
   * パートナーIDで請求書を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/by-partner/{partnerId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getInvoicesByPartnerId(@PathVariable UUID partnerId) {
    List<InvoiceResponse> invoices = invoiceService.getInvoicesByPartnerId(partnerId);
    return ResponseEntity.ok(invoices);
  }

  /**
   * 請求書を作成
   * 権限: ADMIN, ACCOUNTING
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
    InvoiceResponse created = invoiceService.createInvoice(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * 請求書を更新
   * 注意: 発行済・支払済の請求書は更新できない（Service層でガード）
   * 権限: ADMIN, ACCOUNTING
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<InvoiceResponse> updateInvoice(
      @PathVariable UUID id,
      @Valid @RequestBody InvoiceRequest request) {
    InvoiceResponse updated = invoiceService.updateInvoice(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * ステータスを変更
   * 権限: ADMIN, ACCOUNTING
   */
  @PatchMapping("/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<InvoiceResponse> updateStatus(
      @PathVariable UUID id,
      @RequestParam Invoice.InvoiceStatus status) {
    InvoiceResponse updated = invoiceService.updateStatus(id, status);
    return ResponseEntity.ok(updated);
  }

  /**
   * 請求書を「支払済」に変更する専用エンドポイント
   * 発行済(ISSUED)状態の請求書のみ支払済(PAID)に変更可能
   * 権限: ADMIN, ACCOUNTING
   */
  @PatchMapping("/{id}/mark-as-paid")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<InvoiceResponse> markAsPaid(@PathVariable UUID id) {
    InvoiceResponse updated = invoiceService.markAsPaid(id);
    return ResponseEntity.ok(updated);
  }

  /**
   * 請求書を削除
   * 注意: 発行済・支払済の請求書は削除できない（Service層でガード）
   * 権限: ADMIN のみ
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
    invoiceService.deleteInvoice(id);
    return ResponseEntity.noContent().build();
  }
}