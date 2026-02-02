package com.example.prmtool.controller;

import com.example.prmtool.dto.SenderEmailRequest;
import com.example.prmtool.dto.SenderEmailResponse;
import com.example.prmtool.service.SenderEmailAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 送信元メールアドレスコントローラ
 * SYSTEMとADMINのみがアクセス可能
 */
@RestController
@RequestMapping("/api/sender-emails")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SenderEmailAddressController {

  private final SenderEmailAddressService service;

  /**
   * 全ての送信元メールアドレスを取得
   * 権限: SYSTEM, ADMIN
   */
  @GetMapping
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN')")
  public ResponseEntity<List<SenderEmailResponse>> getAllSenderEmails() {
    List<SenderEmailResponse> senderEmails = service.getAllSenderEmails();
    return ResponseEntity.ok(senderEmails);
  }

  /**
   * 有効な送信元メールアドレスのみ取得
   * 権限: SYSTEM, ADMIN, ACCOUNTING（送信時に使用）
   */
  @GetMapping("/active")
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN', 'ACCOUNTING')")
  public ResponseEntity<List<SenderEmailResponse>> getActiveSenderEmails() {
    List<SenderEmailResponse> senderEmails = service.getActiveSenderEmails();
    return ResponseEntity.ok(senderEmails);
  }

  /**
   * IDで送信元メールアドレスを取得
   * 権限: SYSTEM, ADMIN
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN')")
  public ResponseEntity<SenderEmailResponse> getSenderEmailById(@PathVariable UUID id) {
    SenderEmailResponse senderEmail = service.getSenderEmailById(id);
    return ResponseEntity.ok(senderEmail);
  }

  /**
   * デフォルトの送信元メールアドレスを取得
   * 権限: SYSTEM, ADMIN, ACCOUNTING
   */
  @GetMapping("/default")
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN', 'ACCOUNTING')")
  public ResponseEntity<SenderEmailResponse> getDefaultSenderEmail() {
    SenderEmailResponse senderEmail = service.getDefaultSenderEmail();
    return ResponseEntity.ok(senderEmail);
  }

  /**
   * 送信元メールアドレスを作成
   * 権限: SYSTEM, ADMIN
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN')")
  public ResponseEntity<SenderEmailResponse> createSenderEmail(
      @Valid @RequestBody SenderEmailRequest request) {
    SenderEmailResponse created = service.createSenderEmail(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * 送信元メールアドレスを更新
   * 権限: SYSTEM, ADMIN
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN')")
  public ResponseEntity<SenderEmailResponse> updateSenderEmail(
      @PathVariable UUID id,
      @Valid @RequestBody SenderEmailRequest request) {
    SenderEmailResponse updated = service.updateSenderEmail(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * 送信元メールアドレスを削除
   * 権限: SYSTEM, ADMIN
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('SYSTEM', 'ADMIN')")
  public ResponseEntity<Void> deleteSenderEmail(@PathVariable UUID id) {
    service.deleteSenderEmail(id);
    return ResponseEntity.noContent().build();
  }
}