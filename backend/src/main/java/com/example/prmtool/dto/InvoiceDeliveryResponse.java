package com.example.prmtool.dto;

import com.example.prmtool.entity.InvoiceDelivery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 請求書送付レスポンスDTO
 * 送付履歴情報を返却する際に使用
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDeliveryResponse {

  /**
   * 送付履歴ID
   */
  private UUID id;

  /**
   * 請求書ID
   */
  private UUID invoiceId;

  /**
   * 請求書番号
   */
  private String invoiceNumber;

  /**
   * 宛先メールアドレス
   */
  private String recipientEmail;

  /**
   * 送信元メールアドレス
   */
  private String senderEmail;

  /**
   * メールの件名
   */
  private String subject;

  /**
   * メール本文
   */
  private String body;

  /**
   * 送信ステータス
   */
  private InvoiceDelivery.DeliveryStatus status;

  /**
   * エラーメッセージ
   */
  private String errorMessage;

  /**
   * 送信者名
   */
  private String sentBy;

  /**
   * 送信日時
   */
  private LocalDateTime sentAt;

  /**
   * 作成日時
   */
  private LocalDateTime createdAt;
}