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

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // 請求書への参照
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "invoice_id", nullable = false)
  private Invoice invoice;

  // 手数料への参照（任意: 手数料に基づく明細の場合）
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "commission_id")
  private Commission commission;

  // 明細の説明・内容
  @Column(nullable = false, length = 500)
  private String description;

  // 数量
  @Column(nullable = false)
  private Integer quantity;

  // 単価
  @Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
  private BigDecimal unitPrice;

  // 金額（quantity × unitPrice で計算）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal amount;

  // 作成日時
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;
}
