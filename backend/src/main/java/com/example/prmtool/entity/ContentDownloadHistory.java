package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ファイルダウンロード履歴エンティティ
 * ファイルのダウンロード履歴を記録
 */
@Entity
@Table(name = "content_download_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentDownloadHistory {

  /**
   * 履歴の一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * ダウンロードされたファイル
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "file_id", nullable = false)
  private ContentFile file;

  /**
   * ダウンロードしたユーザー
   * nullの場合は外部ユーザー（パートナー）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  /**
   * ダウンロードしたパートナー
   * nullの場合は内部ユーザー
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partner_id")
  private Partner partner;

  /**
   * ダウンロード日時
   */
  @Column(nullable = false)
  private LocalDateTime downloadedAt;

  /**
   * IPアドレス（オプション）
   */
  @Column(length = 50)
  private String ipAddress;

  @PrePersist
  protected void onCreate() {
    if (downloadedAt == null) {
      downloadedAt = LocalDateTime.now();
    }
  }
}