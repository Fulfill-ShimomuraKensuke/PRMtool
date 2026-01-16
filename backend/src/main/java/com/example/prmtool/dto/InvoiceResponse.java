package com.example.prmtool.dto;

import com.example.prmtool.entity.Invoice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

  // 請求書ID
  private UUID id;

  // 請求書番号
  private String invoiceNumber;

  // パートナー情報
  private UUID partnerId;
  private String partnerName;

  // 日付情報
  private LocalDate issueDate;
  private LocalDate dueDate;

  // 金額情報
  private BigDecimal subtotal;        // 小計（税抜）
  private BigDecimal taxAmount;       // 税額
  private BigDecimal totalAmount;     // 合計（税込）

  // ステータス情報
  private Invoice.InvoiceStatus status;
  private String statusLabel;         // ステータスの日本語表示

  // その他
  private String notes;

  // 請求書明細
  private List<InvoiceItemResponse> items;

  // タイムスタンプ
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // ステータスを日本語に変換するヘルパーメソッド
  public static String getStatusLabel(Invoice.InvoiceStatus status) {
    switch (status) {
      case DRAFT:
        return "下書き";
      case ISSUED:
        return "発行済";
      case PAID:
        return "支払済";
      case CANCELLED:
        return "キャンセル";
      default:
        return status.name();
    }
  }

  // 請求書明細のレスポンスDTO
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class InvoiceItemResponse {
    private UUID id;
    private UUID commissionId;      // 手数料ID（任意）
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private LocalDateTime createdAt;
  }
}
