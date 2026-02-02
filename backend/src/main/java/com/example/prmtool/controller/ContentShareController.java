package com.example.prmtool.controller;

import com.example.prmtool.dto.ContentShareRequest;
import com.example.prmtool.dto.ContentShareResponse;
import com.example.prmtool.entity.ContentShareAccessHistory;
import com.example.prmtool.service.ContentShareService;
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
 * コンテンツ共有コントローラ
 * ADMIN、ACCOUNTING、REPがアクセス可能（SYSTEMは制限）
 */
@RestController
@RequestMapping("/api/content-shares")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContentShareController {

  private final ContentShareService service;

  /**
   * 全共有を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentShareResponse>> getAllShares() {
    List<ContentShareResponse> shares = service.getAllShares();
    return ResponseEntity.ok(shares);
  }

  /**
   * 共有をIDで取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<ContentShareResponse> getShareById(@PathVariable UUID id) {
    ContentShareResponse share = service.getShareById(id);
    return ResponseEntity.ok(share);
  }

  /**
   * 指定したファイルの共有を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/by-file/{fileId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentShareResponse>> getSharesByFile(@PathVariable UUID fileId) {
    List<ContentShareResponse> shares = service.getSharesByFile(fileId);
    return ResponseEntity.ok(shares);
  }

  /**
   * 指定したパートナーとの共有を取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/by-partner/{partnerId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentShareResponse>> getSharesByPartner(@PathVariable UUID partnerId) {
    List<ContentShareResponse> shares = service.getSharesByPartner(partnerId);
    return ResponseEntity.ok(shares);
  }

  /**
   * 有効な共有のみ取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/active")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<ContentShareResponse>> getActiveShares() {
    List<ContentShareResponse> shares = service.getActiveShares();
    return ResponseEntity.ok(shares);
  }

  /**
   * 共有を作成
   * 権限: ADMIN, ACCOUNTING
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentShareResponse> createShare(
      @Valid @RequestBody ContentShareRequest request,
      Authentication authentication) {
    // 認証情報からユーザーIDを取得（実際の実装に合わせて調整）
    UUID userId = UUID.fromString(authentication.getName());
    ContentShareResponse created = service.createShare(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * 共有を更新
   * 権限: ADMIN, ACCOUNTING
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentShareResponse> updateShare(
      @PathVariable UUID id,
      @Valid @RequestBody ContentShareRequest request) {
    ContentShareResponse updated = service.updateShare(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * 共有を無効化
   * 権限: ADMIN, ACCOUNTING
   */
  @PatchMapping("/{id}/revoke")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<ContentShareResponse> revokeShare(@PathVariable UUID id) {
    ContentShareResponse revoked = service.revokeShare(id);
    return ResponseEntity.ok(revoked);
  }

  /**
   * 共有ファイルへのアクセスを記録
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @PostMapping("/{id}/access")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<Void> recordAccess(
      @PathVariable UUID id,
      @RequestParam ContentShareAccessHistory.AccessType accessType,
      Authentication authentication,
      @RequestParam(required = false) String ipAddress) {
    // 認証情報からユーザーIDを取得
    UUID userId = UUID.fromString(authentication.getName());
    service.recordAccess(id, userId, accessType, ipAddress);
    return ResponseEntity.ok().build();
  }

  /**
   * 共有のアクセス履歴を取得
   * 権限: ADMIN, ACCOUNTING
   */
  @GetMapping("/{id}/access-history")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<List<ContentShareAccessHistory>> getAccessHistory(@PathVariable UUID id) {
    List<ContentShareAccessHistory> history = service.getAccessHistory(id);
    return ResponseEntity.ok(history);
  }
}