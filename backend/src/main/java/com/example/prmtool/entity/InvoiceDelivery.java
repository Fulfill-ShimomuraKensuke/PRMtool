package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 請求書送付履歴エンティティ
 * 請求書のメール送付履歴を管理
 */
@Entity
@Table(name = "invoice_deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDelivery {

  /**
   * 送付履歴ID
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * 送付対象の請求書
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "invoice_id", nullable = false)
  private Invoice invoice;

  /**
   * 宛先メールアドレス
   */
  @Column(nullable = false, length = 255)
  private String recipientEmail;

  /**
   * 送信元メールアドレス
   */
  @Column(nullable = false, length = 255)
  private String senderEmail;

  /**
   * メールの件名
   */
  @Column(nullable = false, length = 200)
  private String subject;

  /**
   * メール本文
   */
  @Column(nullable = false, columnDefinition = "TEXT")
  private String body;

  /**
   * 使用した請求書テンプレート
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "template_id")
  private InvoiceTemplate template;

  /**
   * 送信ステータス
   * SENT: 送信成功
   * FAILED: 送信失敗
   * PENDING: 送信待ち
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DeliveryStatus status;

  /**
   * エラーメッセージ（送信失敗時）
   */
  @Column(columnDefinition = "TEXT")
  private String errorMessage;

  /**
   * 送信者（ユーザー）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sent_by", nullable = false)
  private User sentBy;

  /**
   * 送信日時
   */
  @Column(nullable = false)
  private LocalDateTime sentAt;

  /**
   * 作成日時（自動設定）
   */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /**
   * 更新日時（自動更新）
   */
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /**
   * 送信ステータス列挙型
   */
  public enum DeliveryStatus {
    SENT, // 送信成功
    FAILED, // 送信失敗
    PENDING // 送信待ち
  }
}