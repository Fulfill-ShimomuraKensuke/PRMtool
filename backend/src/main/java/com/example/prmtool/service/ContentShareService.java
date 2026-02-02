package com.example.prmtool.service;

import com.example.prmtool.dto.ContentShareRequest;
import com.example.prmtool.dto.ContentShareResponse;
import com.example.prmtool.entity.*;
import com.example.prmtool.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * コンテンツ共有サービス
 * ファイル共有とアクセス履歴の管理を担当
 */
@Service
@RequiredArgsConstructor
public class ContentShareService {

  private final ContentShareRepository shareRepository;
  private final ContentShareAccessHistoryRepository accessHistoryRepository;
  private final ContentFileRepository fileRepository;
  private final PartnerRepository partnerRepository;
  private final UserRepository userRepository;

  /**
   * 全共有を取得
   */
  @Transactional(readOnly = true)
  public List<ContentShareResponse> getAllShares() {
    return shareRepository.findAllByOrderBySharedAtDesc().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 共有をIDで取得
   */
  @Transactional(readOnly = true)
  public ContentShareResponse getShareById(UUID id) {
    ContentShare share = shareRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("共有が見つかりません: " + id));
    return convertToResponse(share);
  }

  /**
   * 指定したファイルの共有を取得
   */
  @Transactional(readOnly = true)
  public List<ContentShareResponse> getSharesByFile(UUID fileId) {
    return shareRepository.findByFileIdOrderBySharedAtDesc(fileId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 指定したパートナーとの共有を取得
   */
  @Transactional(readOnly = true)
  public List<ContentShareResponse> getSharesByPartner(UUID partnerId) {
    return shareRepository.findByPartnerIdOrderBySharedAtDesc(partnerId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 有効な共有のみ取得
   */
  @Transactional(readOnly = true)
  public List<ContentShareResponse> getActiveShares() {
    return shareRepository.findByStatusOrderBySharedAtDesc(ContentShare.ShareStatus.ACTIVE).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 共有を作成
   */
  @Transactional
  public ContentShareResponse createShare(ContentShareRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + userId));

    ContentFile file = fileRepository.findById(request.getFileId())
        .orElseThrow(() -> new RuntimeException("ファイルが見つかりません: " + request.getFileId()));

    Partner partner = null;
    if (request.getShareTarget() == ContentShare.ShareTarget.SPECIFIC_PARTNER) {
      if (request.getPartnerId() == null) {
        throw new RuntimeException("特定パートナーへの共有の場合、パートナーIDは必須です");
      }
      partner = partnerRepository.findById(request.getPartnerId())
          .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + request.getPartnerId()));
    }

    ContentShare share = ContentShare.builder()
        .file(file)
        .shareTarget(request.getShareTarget())
        .partner(partner)
        .shareMethod(request.getShareMethod())
        .expiresAt(request.getExpiresAt())
        .downloadLimit(request.getDownloadLimit())
        .currentDownloadCount(0)
        .notifyOnDownload(request.getNotifyOnDownload() != null ? request.getNotifyOnDownload() : false)
        .message(request.getMessage())
        .status(ContentShare.ShareStatus.ACTIVE)
        .sharedBy(user)
        .build();

    ContentShare saved = shareRepository.save(share);
    return convertToResponse(saved);
  }

  /**
   * 共有を更新
   */
  @Transactional
  public ContentShareResponse updateShare(UUID id, ContentShareRequest request) {
    ContentShare share = shareRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("共有が見つかりません: " + id));

    // ステータスがACTIVE以外の場合は更新不可
    if (share.getStatus() != ContentShare.ShareStatus.ACTIVE) {
      throw new RuntimeException("無効化された共有は更新できません");
    }

    share.setExpiresAt(request.getExpiresAt());
    share.setDownloadLimit(request.getDownloadLimit());
    share.setNotifyOnDownload(request.getNotifyOnDownload() != null ? request.getNotifyOnDownload() : false);
    share.setMessage(request.getMessage());

    ContentShare updated = shareRepository.save(share);
    return convertToResponse(updated);
  }

  /**
   * 共有を無効化
   */
  @Transactional
  public ContentShareResponse revokeShare(UUID id) {
    ContentShare share = shareRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("共有が見つかりません: " + id));

    share.revoke();
    ContentShare updated = shareRepository.save(share);
    return convertToResponse(updated);
  }

  /**
   * 共有ファイルへのアクセスを記録
   */
  @Transactional
  public void recordAccess(UUID shareId, UUID userId,
      ContentShareAccessHistory.AccessType accessType,
      String ipAddress) {
    ContentShare share = shareRepository.findById(shareId)
        .orElseThrow(() -> new RuntimeException("共有が見つかりません: " + shareId));

    // ステータスチェック
    if (share.getStatus() != ContentShare.ShareStatus.ACTIVE) {
      throw new RuntimeException("この共有は無効です");
    }

    // 有効期限チェック
    if (share.isExpired()) {
      share.setStatus(ContentShare.ShareStatus.EXPIRED);
      shareRepository.save(share);
      throw new RuntimeException("この共有は期限切れです");
    }

    User user = null;
    if (userId != null) {
      user = userRepository.findById(userId).orElse(null);
    }

    // ダウンロードの場合はカウントを増やす
    if (accessType == ContentShareAccessHistory.AccessType.DOWNLOAD) {
      share.incrementDownloadCount();
      shareRepository.save(share);
    }

    // アクセス履歴を記録
    ContentShareAccessHistory history = ContentShareAccessHistory.builder()
        .share(share)
        .user(user)
        .accessType(accessType)
        .accessedAt(LocalDateTime.now())
        .ipAddress(ipAddress)
        .build();

    accessHistoryRepository.save(history);
  }

  /**
   * 共有のアクセス履歴を取得
   */
  @Transactional(readOnly = true)
  public List<ContentShareAccessHistory> getAccessHistory(UUID shareId) {
    return accessHistoryRepository.findByShareIdOrderByAccessedAtDesc(shareId);
  }

  /**
   * エンティティをレスポンスDTOに変換
   */
  private ContentShareResponse convertToResponse(ContentShare share) {
    return ContentShareResponse.builder()
        .id(share.getId())
        .fileId(share.getFile().getId())
        .fileName(share.getFile().getFileName())
        .shareTarget(share.getShareTarget())
        .partnerId(share.getPartner() != null ? share.getPartner().getId() : null)
        .partnerName(share.getPartner() != null ? share.getPartner().getName() : "全パートナー")
        .shareMethod(share.getShareMethod())
        .expiresAt(share.getExpiresAt())
        .downloadLimit(share.getDownloadLimit())
        .currentDownloadCount(share.getCurrentDownloadCount())
        .notifyOnDownload(share.getNotifyOnDownload())
        .message(share.getMessage())
        .status(share.getStatus())
        .sharedBy(share.getSharedBy().getName())
        .sharedAt(share.getSharedAt())
        .lastAccessedAt(share.getLastAccessedAt())
        .build();
  }
}