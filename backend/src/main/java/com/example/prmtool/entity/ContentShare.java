package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ファイル共有エンティティ
 * ファイルの共有設定と履歴を管理
 */
@Entity
@Table(name = "content_shares")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentShare {

  /**
   * 共有の一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 共有するファイル（必須）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "file_id", nullable = false)
  private ContentFile file;

  /**
   * 共有対象タイプ
   * SPECIFIC_PARTNER: 特定のパートナー
   * ALL_PARTNERS: 全パートナー
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ShareTarget shareTarget;

  /**
   * 共有先パートナー（特定パートナーの場合）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partner_id")
  private Partner partner;

  /**
   * 共有方法
   * SYSTEM_LINK: システム内リンク
   * EMAIL_LINK: メールでリンク送付
   * EMAIL_ATTACH: メールで添付
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ShareMethod shareMethod;

  /**
   * 有効期限
   * nullの場合は無期限
   */
  private LocalDateTime expiresAt;

  /**
   * ダウンロード回数制限
   * nullの場合は無制限
   */
  private Integer downloadLimit;

  /**
   * 現在のダウンロード数
   */
  @Column(nullable = false)
  @Builder.Default
  private Integer currentDownloadCount = 0;

  /**
   * ダウンロード時通知フラグ
   */
  @Column(nullable = false)
  @Builder.Default
  private Boolean notifyOnDownload = false;

  /**
   * 共有時のメッセージ
   */
  @Column(columnDefinition = "TEXT")
  private String message;

  /**
   * 共有ステータス
   * ACTIVE: 有効
   * EXPIRED: 期限切れ
   * REVOKED: 無効化
   * EXHAUSTED: 回数制限到達
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @Builder.Default
  private ShareStatus status = ShareStatus.ACTIVE;

  /**
   * 共有者
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "shared_by", nullable = false)
  private User sharedBy;

  /**
   * 共有日時（自動設定）
   */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime sharedAt;

  /**
   * 最終アクセス日時
   */
  private LocalDateTime lastAccessedAt;

  /**
   * 共有対象タイプ列挙型
   */
  public enum ShareTarget {
    SPECIFIC_PARTNER, // 特定のパートナー
    ALL_PARTNERS // 全パートナー
  }

  /**
   * 共有方法列挙型
   */
  public enum ShareMethod {
    SYSTEM_LINK, // システム内リンク
    EMAIL_LINK, // メールでリンク送付
    EMAIL_ATTACH // メールで添付
  }

  /**
   * 共有ステータス列挙型
   */
  public enum ShareStatus {
    ACTIVE, // 有効
    EXPIRED, // 期限切れ
    REVOKED, // 無効化
    EXHAUSTED // 回数制限到達
  }

  /**
   * ダウンロード回数を増やす
   */
  public void incrementDownloadCount() {
    this.currentDownloadCount++;
    this.lastAccessedAt = LocalDateTime.now();

    // ダウンロード制限に達したらステータスを更新
    if (downloadLimit != null && currentDownloadCount >= downloadLimit) {
      this.status = ShareStatus.EXHAUSTED;
    }
  }

  /**
   * 有効期限をチェック
   */
  public boolean isExpired() {
    return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
  }

  /**
   * 共有を無効化
   */
  public void revoke() {
    this.status = ShareStatus.REVOKED;
  }
}