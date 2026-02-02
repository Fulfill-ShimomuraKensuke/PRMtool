package com.example.prmtool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 送信元メールアドレスリクエストDTO
 * API経由で送信元メールアドレスを作成・更新する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SenderEmailRequest {

  /**
   * メールアドレス（必須）
   */
  @NotBlank(message = "メールアドレスは必須です")
  @Email(message = "正しいメールアドレス形式で入力してください")
  private String email;

  /**
   * 表示名（必須）
   */
  @NotBlank(message = "表示名は必須です")
  private String displayName;

  /**
   * デフォルト送信元フラグ
   */
  @Builder.Default
  private Boolean isDefault = false;

  /**
   * 有効フラグ
   */
  @Builder.Default
  private Boolean isActive = true;
}