package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "commissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commission {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // 案件への参照
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  // パートナーへの参照
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partner_id", nullable = false)
  private Partner partner;

  // 基準金額（手数料計算の元となる金額）
  @Column(name = "base_amount", precision = 15, scale = 2, nullable = false)
  private BigDecimal baseAmount;

  // 手数料率（パーセンテージ）
  @Column(name = "rate", precision = 5, scale = 2, nullable = false)
  private BigDecimal rate;

  // 手数料金額（baseAmount × rate で計算）
  @Column(name = "amount", precision = 15, scale = 2, nullable = false)
  private BigDecimal amount;

  // 手数料のステータス（PENDING: 未承認, APPROVED: 承認済, PAID: 支払済）
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CommissionStatus status;

  // 支払日（支払済の場合）
  @Column(name = "payment_date")
  private LocalDate paymentDate;

  // 備考・メモ
  @Column(columnDefinition = "TEXT")
  private String notes;

  // 作成日時
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  // 更新日時
  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // 手数料のステータスを定義
  public enum CommissionStatus {
    PENDING,   // 未承認
    APPROVED,  // 承認済
    PAID       // 支払済
  }
}
