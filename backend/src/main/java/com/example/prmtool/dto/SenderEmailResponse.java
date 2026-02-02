package com.example.prmtool.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 送信元メールアドレスレスポンスDTO
 * API経由で送信元メールアドレス情報を返却する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SenderEmailResponse {

  /**
   * 送信元メールアドレスID
   */
  private UUID id;

  /**
   * メールアドレス
   */
  private String email;

  /**
   * 表示名
   */
  private String displayName;

  /**
   * デフォルト送信元フラグ
   */
  private Boolean isDefault;

  /**
   * 有効フラグ
   */
  private Boolean isActive;

  /**
   * 作成日時
   */
  private LocalDateTime createdAt;

  /**
   * 更新日時
   */
  private LocalDateTime updatedAt;
}