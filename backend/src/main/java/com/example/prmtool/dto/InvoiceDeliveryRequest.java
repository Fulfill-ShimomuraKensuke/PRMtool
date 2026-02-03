package com.example.prmtool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 請求書送付リクエストDTO
 * 請求書をメール送付する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDeliveryRequest {

  /**
   * 送付する請求書ID（必須）
   */
  @NotNull(message = "請求書IDは必須です")
  private UUID invoiceId;

  /**
   * 宛先メールアドレス（必須）
   */
  @NotBlank(message = "宛先メールアドレスは必須です")
  @Email(message = "有効なメールアドレスを入力してください")
  private String recipientEmail;

  /**
   * 送信元メールアドレスID
   * nullの場合はデフォルトの送信元メールアドレスを使用
   */
  private UUID senderEmailId;

  /**
   * メールの件名
   * nullの場合はデフォルトの件名を使用
   */
  private String subject;

  /**
   * メール本文
   * nullの場合はデフォルトの本文を使用
   */
  private String body;

  /**
   * PDFを添付するかどうか
   */
  @Builder.Default
  private Boolean attachPdf = true;
}