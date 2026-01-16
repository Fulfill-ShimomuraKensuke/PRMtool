package com.example.prmtool.dto;

import com.example.prmtool.entity.Commission;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionRequest {

  // 案件ID
  @NotNull(message = "案件IDは必須です")
  private UUID projectId;

  // パートナーID
  @NotNull(message = "パートナーIDは必須です")
  private UUID partnerId;

  // 基準金額
  @NotNull(message = "基準金額は必須です")
  @DecimalMin(value = "0.0", message = "基準金額は0以上である必要があります")
  private BigDecimal baseAmount;

  // 手数料率（パーセンテージ）
  @NotNull(message = "手数料率は必須です")
  @DecimalMin(value = "0.0", message = "手数料率は0以上である必要があります")
  private BigDecimal rate;

  // 手数料のステータス
  @NotNull(message = "ステータスは必須です")
  private Commission.CommissionStatus status;

  // 支払日（任意）
  private LocalDate paymentDate;

  // 備考（任意）
  private String notes;
}
