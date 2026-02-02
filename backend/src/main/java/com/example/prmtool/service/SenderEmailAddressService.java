package com.example.prmtool.service;

import com.example.prmtool.dto.SenderEmailRequest;
import com.example.prmtool.dto.SenderEmailResponse;
import com.example.prmtool.entity.SenderEmailAddress;
import com.example.prmtool.repository.SenderEmailAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 送信元メールアドレスサービス
 * ビジネスロジックを担当
 */
@Service
@RequiredArgsConstructor
public class SenderEmailAddressService {

  private final SenderEmailAddressRepository repository;

  /**
   * 全ての送信元メールアドレスを取得
   */
  @Transactional(readOnly = true)
  public List<SenderEmailResponse> getAllSenderEmails() {
    return repository.findAllByOrderByCreatedAtAsc().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 有効な送信元メールアドレスのみ取得
   */
  @Transactional(readOnly = true)
  public List<SenderEmailResponse> getActiveSenderEmails() {
    return repository.findByIsActiveTrueOrderByCreatedAtAsc().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * IDで送信元メールアドレスを取得
   */
  @Transactional(readOnly = true)
  public SenderEmailResponse getSenderEmailById(UUID id) {
    SenderEmailAddress senderEmail = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("送信元メールアドレスが見つかりません: " + id));
    return convertToResponse(senderEmail);
  }

  /**
   * デフォルトの送信元メールアドレスを取得
   */
  @Transactional(readOnly = true)
  public SenderEmailResponse getDefaultSenderEmail() {
    SenderEmailAddress senderEmail = repository.findByIsDefaultTrue()
        .orElseThrow(() -> new RuntimeException("デフォルトの送信元メールアドレスが設定されていません"));
    return convertToResponse(senderEmail);
  }

  /**
   * 送信元メールアドレスを作成
   */
  @Transactional
  public SenderEmailResponse createSenderEmail(SenderEmailRequest request) {
    // メールアドレスの重複チェック
    if (repository.existsByEmail(request.getEmail())) {
      throw new RuntimeException("このメールアドレスは既に登録されています: " + request.getEmail());
    }

    // デフォルトに設定する場合、既存のデフォルトを解除
    if (request.getIsDefault()) {
      clearExistingDefault();
    }

    SenderEmailAddress senderEmail = SenderEmailAddress.builder()
        .email(request.getEmail())
        .displayName(request.getDisplayName())
        .isDefault(request.getIsDefault())
        .isActive(request.getIsActive())
        .build();

    SenderEmailAddress saved = repository.save(senderEmail);
    return convertToResponse(saved);
  }

  /**
   * 送信元メールアドレスを更新
   */
  @Transactional
  public SenderEmailResponse updateSenderEmail(UUID id, SenderEmailRequest request) {
    SenderEmailAddress senderEmail = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("送信元メールアドレスが見つかりません: " + id));

    // メールアドレスの重複チェック（自分自身は除外）
    if (repository.existsByEmailAndIdNot(request.getEmail(), id)) {
      throw new RuntimeException("このメールアドレスは既に登録されています: " + request.getEmail());
    }

    // デフォルトに設定する場合、既存のデフォルトを解除
    if (request.getIsDefault() && !senderEmail.getIsDefault()) {
      clearExistingDefault();
    }

    senderEmail.setEmail(request.getEmail());
    senderEmail.setDisplayName(request.getDisplayName());
    senderEmail.setIsDefault(request.getIsDefault());
    senderEmail.setIsActive(request.getIsActive());

    SenderEmailAddress updated = repository.save(senderEmail);
    return convertToResponse(updated);
  }

  /**
   * 送信元メールアドレスを削除
   */
  @Transactional
  public void deleteSenderEmail(UUID id) {
    SenderEmailAddress senderEmail = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("送信元メールアドレスが見つかりません: " + id));

    // デフォルトの送信元は削除不可
    if (senderEmail.getIsDefault()) {
      throw new RuntimeException("デフォルトの送信元メールアドレスは削除できません");
    }

    repository.delete(senderEmail);
  }

  /**
   * 既存のデフォルト設定を解除
   */
  private void clearExistingDefault() {
    repository.findByIsDefaultTrue().ifPresent(existing -> {
      existing.setIsDefault(false);
      repository.save(existing);
    });
  }

  /**
   * エンティティをレスポンスDTOに変換
   */
  private SenderEmailResponse convertToResponse(SenderEmailAddress senderEmail) {
    return SenderEmailResponse.builder()
        .id(senderEmail.getId())
        .email(senderEmail.getEmail())
        .displayName(senderEmail.getDisplayName())
        .isDefault(senderEmail.getIsDefault())
        .isActive(senderEmail.getIsActive())
        .createdAt(senderEmail.getCreatedAt())
        .updatedAt(senderEmail.getUpdatedAt())
        .build();
  }
}