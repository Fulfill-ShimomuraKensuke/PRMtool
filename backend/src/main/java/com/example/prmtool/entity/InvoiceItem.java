package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 請求書明細エンティティ
 * 手数料ルールの内容をコピーして保持（過去の請求書に影響しないように）
 */
@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  // 請求書への参照
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "invoice_id", nullable = false)
  private Invoice invoice;

  // どの手数料ルールを適用したか（参照のみ、計算には使用しない）
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "commission_rule_id")
  private CommissionRule appliedCommissionRule;

  // 明細の説明
  @Column(nullable = false, length = 500)
  private String description;

  // 数量
  @Column(nullable = false)
  private Integer quantity;

  // 単価
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal unitPrice;

  // 商品金額（quantity × unitPrice）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal productAmount;

  // --- 以下、手数料ルールをコピーして保持 ---

  // 適用した手数料タイプ（請求書作成時点のルールをコピー）
  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private CommissionRule.CommissionType appliedCommissionType;

  // 適用した手数料率（%）- タイプが RATE の場合
  @Column(precision = 5, scale = 2)
  private BigDecimal appliedRatePercent;

  // 適用した固定金額 - タイプが FIXED の場合
  @Column(precision = 15, scale = 2)
  private BigDecimal appliedFixedAmount;

  // 手数料額（計算結果を保存）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal commissionAmount;

  // 明細合計（productAmount + commissionAmount）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal itemTotal;

  // 作成日時
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
}