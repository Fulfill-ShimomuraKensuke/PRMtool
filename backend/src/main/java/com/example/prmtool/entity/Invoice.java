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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 請求書エンティティ
 * 「確定結果」を保持し、過去の状態を変更しない
 */
@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  // 請求書番号（例: INV-2026-0001）
  @Column(unique = true, nullable = false, length = 50)
  private String invoiceNumber;

  // パートナーへの参照
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partner_id", nullable = false)
  private Partner partner;

  // 発行日
  @Column(nullable = false)
  private LocalDate issueDate;

  // 支払期限
  @Column(nullable = false)
  private LocalDate dueDate;

  // 消費税区分
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private TaxCategory taxCategory;

  // 消費税率（請求書作成時点の税率を保持）
  @Column(precision = 5, scale = 4, nullable = false)
  private BigDecimal taxRate;

  // 商品小計（税抜）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal subtotal;

  // 手数料小計
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal commissionSubtotal;

  // 課税対象額（消費税区分によって異なる）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal taxableAmount;

  // 消費税額
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal taxAmount;

  // 合計金額（税込）
  @Column(precision = 15, scale = 2, nullable = false)
  private BigDecimal totalAmount;

  // ステータス
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private InvoiceStatus status;

  // 備考
  @Column(columnDefinition = "TEXT")
  private String notes;

  // 請求書明細（1つの請求書に複数の明細、最低1件）
  @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<InvoiceItem> items = new ArrayList<>();

  // 作成日時（この時点で金額が確定し、後から変わらない）
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  // 更新日時
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /**
   * 消費税区分
   */
  public enum TaxCategory {
    TAX_INCLUDED, // あり（商品＋手数料に課税）
    TAX_ON_PRODUCT_ONLY, // 手数料抜き（商品部分のみ課税）
    TAX_EXEMPT // なし（非課税）
  }

  /**
   * 請求書ステータス
   */
  public enum InvoiceStatus {
    DRAFT, // 下書き
    ISSUED, // 発行済
    PAID, // 支払済
    CANCELLED // キャンセル
  }

  /**
   * 明細を追加するヘルパーメソッド
   */
  public void addItem(InvoiceItem item) {
    items.add(item);
    item.setInvoice(this);
  }

  /**
   * 明細を削除するヘルパーメソッド
   */
  public void removeItem(InvoiceItem item) {
    items.remove(item);
    item.setInvoice(null);
  }
}