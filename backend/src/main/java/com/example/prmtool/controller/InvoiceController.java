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
 * Controller は薄く、ビジネスロジックは Service に集約
 */
@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InvoiceController {

  private final InvoiceService invoiceService;

  /**
   * 全請求書を取得
   */
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
    List<InvoiceResponse> invoices = invoiceService.getAllInvoices();
    return ResponseEntity.ok(invoices);
  }

  /**
   * IDで請求書を取得
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
    InvoiceResponse invoice = invoiceService.getInvoiceById(id);
    return ResponseEntity.ok(invoice);
  }

  /**
   * パートナーIDで請求書を取得
   */
  @GetMapping("/by-partner/{partnerId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<InvoiceResponse>> getInvoicesByPartnerId(@PathVariable UUID partnerId) {
    List<InvoiceResponse> invoices = invoiceService.getInvoicesByPartnerId(partnerId);
    return ResponseEntity.ok(invoices);
  }

  /**
   * 請求書を作成
   * 手数料ルールの内容をコピーして確定結果を保存
   */
  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
    InvoiceResponse created = invoiceService.createInvoice(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * 請求書を更新
   * 注意: 発行済・支払済の請求書は更新できない
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InvoiceResponse> updateInvoice(
      @PathVariable UUID id,
      @Valid @RequestBody InvoiceRequest request) {
    InvoiceResponse updated = invoiceService.updateInvoice(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * ステータスを変更
   */
  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InvoiceResponse> updateStatus(
      @PathVariable UUID id,
      @RequestParam Invoice.InvoiceStatus status) {
    InvoiceResponse updated = invoiceService.updateStatus(id, status);
    return ResponseEntity.ok(updated);
  }

  /**
   * 請求書を削除
   * 注意: 発行済・支払済の請求書は削除できない
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
    invoiceService.deleteInvoice(id);
    return ResponseEntity.noContent().build();
  }
}