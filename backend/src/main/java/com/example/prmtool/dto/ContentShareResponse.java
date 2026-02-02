package com.example.prmtool.dto;

import com.example.prmtool.entity.ContentShare;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * コンテンツ共有レスポンスDTO
 * 共有情報を返却する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentShareResponse {

  /**
   * 共有ID
   */
  private UUID id;

  /**
   * ファイルID
   */
  private UUID fileId;

  /**
   * ファイル名
   */
  private String fileName;

  /**
   * 共有対象タイプ
   */
  private ContentShare.ShareTarget shareTarget;

  /**
   * パートナーID
   */
  private UUID partnerId;

  /**
   * パートナー名
   */
  private String partnerName;

  /**
   * 共有方法
   */
  private ContentShare.ShareMethod shareMethod;

  /**
   * 有効期限
   */
  private LocalDateTime expiresAt;

  /**
   * ダウンロード回数制限
   */
  private Integer downloadLimit;

  /**
   * 現在のダウンロード数
   */
  private Integer currentDownloadCount;

  /**
   * ダウンロード時通知フラグ
   */
  private Boolean notifyOnDownload;

  /**
   * 共有時のメッセージ
   */
  private String message;

  /**
   * 共有ステータス
   */
  private ContentShare.ShareStatus status;

  /**
   * 共有者名
   */
  private String sharedBy;

  /**
   * 共有日時
   */
  private LocalDateTime sharedAt;

  /**
   * 最終アクセス日時
   */
  private LocalDateTime lastAccessedAt;
}