package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 手数料ルールエンティティ
 * 案件ごとの手数料契約ルールを管理
 * 「ルール」であり「確定結果」ではない点に注意
 */
@Entity
@Table(name = "commission_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionRule {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  // 案件への参照（どの案件の手数料ルールか）
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  // ルール名（例: 「初期契約」「追加契約」など）
  @Column(nullable = false, length = 200)
  private String ruleName;

  // 手数料タイプ（RATE: %指定、FIXED: 固定金額）
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CommissionType commissionType;

  // 手数料率（%）- commissionType が RATE の場合に使用
  // 例: 3.5% なら 3.5 を格納
  @Column(precision = 5, scale = 2)
  private BigDecimal ratePercent;

  // 1件あたり固定金額 - commissionType が FIXED の場合に使用
  @Column(precision = 15, scale = 2)
  private BigDecimal fixedAmount;

  // ステータス（請求書で使用できるのは「確定」のみ）
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CommissionStatus status;

  // 備考
  @Column(columnDefinition = "TEXT")
  private String notes;

  // 作成日時
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  // 更新日時
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /**
   * 手数料タイプ
   */
  public enum CommissionType {
    RATE, // %指定（例: 3.5%）
    FIXED // 1件あたり固定金額（例: 5,000円）
  }

  /**
   * 手数料ステータス
   * 請求書で使用できるのは「確定」のみ
   */
  public enum CommissionStatus {
    UNAPPROVED, // 未承認
    REVIEWING, // 確認中
    CONFIRMED, // 確定（請求書で使用可能）
    PAID, // 支払済
    DISABLED // 使用不可
  }

  /**
   * このルールが請求書で使用可能かチェック
   * 
   * @return 使用可能な場合 true
   */
  public boolean isUsableForInvoice() {
    return status == CommissionStatus.CONFIRMED;
  }

  /**
   * バリデーション: 手数料タイプに応じて必要なフィールドが設定されているかチェック
   */
  @PrePersist
  @PreUpdate
  private void validate() {
    if (commissionType == CommissionType.RATE) {
      if (ratePercent == null || ratePercent.compareTo(BigDecimal.ZERO) < 0) {
        throw new IllegalStateException("手数料タイプがRATEの場合、ratePercentは0以上である必要があります");
      }
    } else if (commissionType == CommissionType.FIXED) {
      if (fixedAmount == null || fixedAmount.compareTo(BigDecimal.ZERO) < 0) {
        throw new IllegalStateException("手数料タイプがFIXEDの場合、fixedAmountは0以上である必要があります");
      }
    }
  }
}