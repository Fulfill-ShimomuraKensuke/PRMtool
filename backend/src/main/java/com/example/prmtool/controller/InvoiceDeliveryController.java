package com.example.prmtool.controller;

import com.example.prmtool.dto.InvoiceDeliveryRequest;
import com.example.prmtool.dto.InvoiceDeliveryResponse;
import com.example.prmtool.entity.InvoiceDelivery;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import com.example.prmtool.service.InvoiceDeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 請求書送付コントローラ
 * 請求書のメール送信と送付履歴の管理を提供
 * ADMIN、ACCOUNTINGがアクセス可能
 */
@RestController
@RequestMapping("/api/invoice-deliveries")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InvoiceDeliveryController {

  private final InvoiceDeliveryService service;
  private final UserRepository userRepository;  // UserRepositoryを追加

  /**
   * 請求書をメール送付
   * 権限: ADMIN, ACCOUNTING
   */
  @PostMapping("/send")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<InvoiceDeliveryResponse> sendInvoice(
      @Valid @RequestBody InvoiceDeliveryRequest request,
      Authentication authentication) {

    // ログインIDからユーザーを取得
    String loginId = authentication.getName();
    User user = userRepository.findByLoginId(loginId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + loginId));

    InvoiceDeliveryResponse response = service.sendInvoice(request, user.getId());

    // 送信失敗の場合は400を返す
    if (response.getStatus() == InvoiceDelivery.DeliveryStatus.FAILED) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * 指定した請求書の送付履歴を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/by-invoice/{invoiceId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<InvoiceDeliveryResponse>> getDeliveriesByInvoice(
      @PathVariable UUID invoiceId) {
    List<InvoiceDeliveryResponse> deliveries = service.getDeliveriesByInvoice(invoiceId);
    return ResponseEntity.ok(deliveries);
  }

  /**
   * 指定した送信者の送付履歴を取得
   * 権限: ADMIN, ACCOUNTING
   */
  @GetMapping("/by-sender/{userId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<List<InvoiceDeliveryResponse>> getDeliveriesBySender(
      @PathVariable UUID userId) {
    List<InvoiceDeliveryResponse> deliveries = service.getDeliveriesBySender(userId);
    return ResponseEntity.ok(deliveries);
  }

  /**
   * 指定したステータスの送付履歴を取得
   * 権限: ADMIN, ACCOUNTING
   */
  @GetMapping("/by-status/{status}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<List<InvoiceDeliveryResponse>> getDeliveriesByStatus(
      @PathVariable InvoiceDelivery.DeliveryStatus status) {
    List<InvoiceDeliveryResponse> deliveries = service.getDeliveriesByStatus(status);
    return ResponseEntity.ok(deliveries);
  }

  /**
   * 送付履歴をIDで取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<InvoiceDeliveryResponse> getDeliveryById(@PathVariable UUID id) {
    InvoiceDeliveryResponse delivery = service.getDeliveryById(id);
    return ResponseEntity.ok(delivery);
  }
}