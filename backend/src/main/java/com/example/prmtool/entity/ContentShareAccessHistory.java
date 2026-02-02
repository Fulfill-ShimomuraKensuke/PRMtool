package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ファイル共有アクセス履歴エンティティ
 * 共有ファイルへのアクセス履歴を記録
 */
@Entity
@Table(name = "content_share_access_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentShareAccessHistory {

  /**
   * 履歴の一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 共有への参照
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "share_id", nullable = false)
  private ContentShare share;

  /**
   * アクセスしたユーザー
   * nullの場合は外部ユーザー（パートナー）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  /**
   * アクセスタイプ
   * VIEW: 閲覧
   * DOWNLOAD: ダウンロード
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AccessType accessType;

  /**
   * アクセス日時
   */
  @Column(nullable = false)
  private LocalDateTime accessedAt;

  /**
   * IPアドレス
   */
  @Column(length = 50)
  private String ipAddress;

  /**
   * アクセスタイプ列挙型
   */
  public enum AccessType {
    VIEW, // 閲覧
    DOWNLOAD // ダウンロード
  }

  @PrePersist
  protected void onCreate() {
    if (accessedAt == null) {
      accessedAt = LocalDateTime.now();
    }
  }
}