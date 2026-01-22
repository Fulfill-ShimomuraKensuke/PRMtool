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
 * フロントエンドでパートナー整合性チェックができるよう、案件のパートナー情報を含む
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionRuleResponse {

  // 手数料ルールID
  private UUID id;

  // 案件情報
  private UUID projectId;
  private String projectName;

  // 案件のパートナー情報（パートナー整合性チェック用）
  private UUID projectPartnerId;
  private String projectPartnerName;

  // 手数料ルール詳細
  private String ruleName;
  private CommissionRule.CommissionType commissionType;
  private BigDecimal ratePercent;
  private BigDecimal fixedAmount;
  private CommissionRule.CommissionStatus status;
  private String notes;

  // タイムスタンプ
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}