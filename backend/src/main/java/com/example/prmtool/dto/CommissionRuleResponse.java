package com.example.prmtool.dto;

import com.example.prmtool.entity.CommissionRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 手数料ルールレスポンス
 * API通信用のデータ転送オブジェクト
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionRuleResponse {

  private UUID id;
  private UUID projectId;
  private String projectName;
  private String ruleName;
  private CommissionRule.CommissionType commissionType;
  private BigDecimal ratePercent;
  private BigDecimal fixedAmount;
  private CommissionRule.CommissionStatus status;
  private String notes;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
