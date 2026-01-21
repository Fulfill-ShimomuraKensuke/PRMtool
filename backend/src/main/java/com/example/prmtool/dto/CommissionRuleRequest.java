package com.example.prmtool.dto;

import com.example.prmtool.entity.CommissionRule;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 手数料ルール作成・更新リクエスト
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionRuleRequest {

  // 案件ID
  @NotNull(message = "案件IDは必須です")
  private UUID projectId;

  // ルール名
  @NotBlank(message = "ルール名は必須です")
  private String ruleName;

  // 手数料タイプ
  @NotNull(message = "手数料タイプは必須です")
  private CommissionRule.CommissionType commissionType;

  // 手数料率（%）- タイプが RATE の場合
  @DecimalMin(value = "0.0", message = "手数料率は0以上である必要があります")
  private BigDecimal ratePercent;

  // 固定金額 - タイプが FIXED の場合
  @DecimalMin(value = "0.0", message = "固定金額は0以上である必要があります")
  private BigDecimal fixedAmount;

  // ステータス
  @NotNull(message = "ステータスは必須です")
  private CommissionRule.CommissionStatus status;

  // 備考
  private String notes;
}