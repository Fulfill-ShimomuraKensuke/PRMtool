package com.example.prmtool.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * コンテンツファイルエンティティ
 * アップロードされたファイルの情報を管理
 */
@Entity
@Table(name = "content_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFile {

  /**
   * ファイルの一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 所属するフォルダ（必須）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "folder_id", nullable = false)
  private ContentFolder folder;

  /**
   * ファイル名（必須）
   */
  @Column(nullable = false, length = 200)
  @NotBlank(message = "ファイル名は必須です")
  private String fileName;

  /**
   * タイトル（表示用）
   */
  @Column(length = 200)
  private String title;

  /**
   * ファイルの説明
   */
  @Column(columnDefinition = "TEXT")
  private String description;

  /**
   * ファイルURL（S3やストレージのURL）
   */
  @Column(nullable = false, length = 500)
  @NotBlank(message = "ファイルURLは必須です")
  private String fileUrl;

  /**
   * ファイルタイプ（MIMEタイプ）
   */
  @Column(nullable = false, length = 50)
  @NotBlank(message = "ファイルタイプは必須です")
  private String fileType;

  /**
   * ファイルサイズ（バイト単位）
   */
  @Column(nullable = false)
  private Long fileSize;

  /**
   * タグ（カンマ区切り）
   * 検索やフィルタリングに使用
   */
  @Column(length = 500)
  private String tags;

  /**
   * バージョン番号
   */
  @Column(nullable = false, length = 20)
  @Builder.Default
  private String version = "v1.0";

  /**
   * 前バージョンのファイル（バージョン管理用）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "previous_version_id")
  private ContentFile previousVersion;

  /**
   * アクセスレベル
   * PUBLIC: 全ユーザー
   * ROLE_BASED: ロールベース
   * PARTNER_BASED: パートナーベース
   * PRIVATE: アップロード者のみ
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @Builder.Default
  private AccessLevel accessLevel = AccessLevel.PRIVATE;

  /**
   * 許可されたロール（JSON形式）
   * accessLevel = ROLE_BASEDの場合に使用
   */
  @Column(columnDefinition = "TEXT")
  private String allowedRoles;

  /**
   * 許可されたパートナーID（JSON形式）
   * accessLevel = PARTNER_BASEDの場合に使用
   */
  @Column(columnDefinition = "TEXT")
  private String allowedPartnerIds;

  /**
   * ダウンロード回数
   */
  @Column(nullable = false)
  @Builder.Default
  private Integer downloadCount = 0;

  /**
   * アップロード者
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by", nullable = false)
  private User uploadedBy;

  /**
   * アップロード日時（自動設定）
   */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime uploadedAt;

  /**
   * 更新日時（自動設定）
   */
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /**
   * アクセスレベル列挙型
   */
  public enum AccessLevel {
    PUBLIC, // 全ユーザー
    ROLE_BASED, // ロールベース
    PARTNER_BASED, // パートナーベース
    PRIVATE // プライベート（アップロード者のみ）
  }

  /**
   * ダウンロード回数を増やす
   */
  public void incrementDownloadCount() {
    if (this.downloadCount == null) {
      this.downloadCount = 0;
    }
    this.downloadCount++;
  }
}