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

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // 請求書番号（例: INV-2026-0001）
  @Column(name = "invoice_number", unique = true, nullable = false, length = 50)
  private String invoiceNumber;

  // パートナーへの参照
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partner_id", nullable = false)
  private Partner partner;

  // 発行日
  @Column(name = "issue_date", nullable = false)
  private LocalDate issueDate;

  // 支払期限
  @Column(name = "due_date", nullable = false)
  private LocalDate dueDate;

  // 合計金額（税抜）
  @Column(name = "subtotal", precision = 15, scale = 2, nullable = false)
  private BigDecimal subtotal;

  // 税額
  @Column(name = "tax_amount", precision = 15, scale = 2, nullable = false)
  private BigDecimal taxAmount;

  // 合計金額（税込）
  @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
  private BigDecimal totalAmount;

  // 請求書のステータス（DRAFT: 下書き, ISSUED: 発行済, PAID: 支払済, CANCELLED: キャンセル）
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private InvoiceStatus status;

  // 備考・メモ
  @Column(columnDefinition = "TEXT")
  private String notes;

  // 請求書明細（1つの請求書に複数の明細）
  @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<InvoiceItem> items = new ArrayList<>();

  // 作成日時
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  // 更新日時
  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // 請求書のステータスを定義
  public enum InvoiceStatus {
    DRAFT,      // 下書き
    ISSUED,     // 発行済
    PAID,       // 支払済
    CANCELLED   // キャンセル
  }

  // 請求書明細を追加するヘルパーメソッド
  public void addItem(InvoiceItem item) {
    items.add(item);
    item.setInvoice(this);
  }

  // 請求書明細を削除するヘルパーメソッド
  public void removeItem(InvoiceItem item) {
    items.remove(item);
    item.setInvoice(null);
  }
}
