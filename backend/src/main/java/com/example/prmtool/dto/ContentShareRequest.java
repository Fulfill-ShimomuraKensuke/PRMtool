package com.example.prmtool.dto;

import com.example.prmtool.entity.ContentShare;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * コンテンツ共有リクエストDTO
 * 共有作成・更新時に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentShareRequest {

  /**
   * 共有するファイルID（必須）
   */
  @NotNull(message = "ファイルIDは必須です")
  private UUID fileId;

  /**
   * 共有対象タイプ（必須）
   */
  @NotNull(message = "共有対象タイプは必須です")
  private ContentShare.ShareTarget shareTarget;

  /**
   * 共有先パートナーID
   * shareTarget = SPECIFIC_PARTNERの場合は必須
   */
  private UUID partnerId;

  /**
   * 共有方法（必須）
   */
  @NotNull(message = "共有方法は必須です")
  private ContentShare.ShareMethod shareMethod;

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
   * ダウンロード時通知フラグ
   */
  private Boolean notifyOnDownload;

  /**
   * 共有時のメッセージ
   */
  private String message;
}