package com.example.prmtool.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * パートナーダッシュボードレスポンス
 * 新設計に対応（実績ベース統計）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerDashboardResponse {

  // パートナー基本情報
  private UUID partnerId;
  private String partnerName;
  private String industry;

  // 案件統計
  private Long totalProjects; // 総案件数
  private Long activeProjects; // 進行中の案件数
  private Long completedProjects; // 完了した案件数

  // 手数料統計（実績ベース：実際に請求した金額）
  private BigDecimal totalCommission; // 総手数料（全請求書）
  private BigDecimal draftCommission; // 下書き請求書の手数料
  private BigDecimal issuedCommission; // 発行済請求書の手数料
  private BigDecimal paidCommission; // 支払済請求書の手数料

  // 手数料ルール統計（契約ベース：任意）
  private Long totalCommissionRules; // 総手数料ルール数
  private Long confirmedRules; // 確定済ルール数
  private Long disabledRules; // 無効化されたルール数

  // 請求書統計
  private Long totalInvoices; // 総請求書数
  private Long draftInvoices; // 下書き請求書数
  private Long issuedInvoices; // 発行済請求書数
  private Long paidInvoices; // 支払済請求書数
  private BigDecimal totalInvoiceAmount; // 総請求金額（税込）

  // ステータス別の手数料内訳（実績ベース）
  private Map<String, BigDecimal> commissionByInvoiceStatus;

  // ステータス別の請求書件数
  private Map<String, Long> invoiceCountByStatus;
}