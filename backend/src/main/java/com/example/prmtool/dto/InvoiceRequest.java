package com.example.prmtool.dto;

import com.example.prmtool.entity.Invoice;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {

  // パートナーID
  @NotNull(message = "パートナーIDは必須です")
  private UUID partnerId;

  // 発行日
  @NotNull(message = "発行日は必須です")
  private LocalDate issueDate;

  // 支払期限
  @NotNull(message = "支払期限は必須です")
  private LocalDate dueDate;

  // ステータス
  @NotNull(message = "ステータスは必須です")
  private Invoice.InvoiceStatus status;

  // 備考（任意）
  private String notes;

  // 請求書明細リスト
  @NotEmpty(message = "明細は最低1つ必要です")
  private List<InvoiceItemRequest> items;

  // 請求書明細の内部クラス
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class InvoiceItemRequest {
    // 手数料ID（任意: 手数料に基づく明細の場合）
    private UUID commissionId;

    // 明細の説明
    @NotNull(message = "説明は必須です")
    private String description;

    // 数量
    @NotNull(message = "数量は必須です")
    private Integer quantity;

    // 単価
    @NotNull(message = "単価は必須です")
    private java.math.BigDecimal unitPrice;
  }
}
