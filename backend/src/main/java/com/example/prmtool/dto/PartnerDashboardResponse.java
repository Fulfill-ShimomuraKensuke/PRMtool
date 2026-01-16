package com.example.prmtool.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

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
  private Long totalProjects;               // 総案件数
  private Long activeProjects;              // 進行中の案件数
  private Long completedProjects;           // 完了した案件数

  // 手数料統計
  private BigDecimal totalCommission;       // 総手数料
  private BigDecimal pendingCommission;     // 未承認手数料
  private BigDecimal approvedCommission;    // 承認済手数料
  private BigDecimal paidCommission;        // 支払済手数料

  // 請求書統計
  private Long totalInvoices;               // 総請求書数
  private Long draftInvoices;               // 下書き請求書数
  private Long issuedInvoices;              // 発行済請求書数
  private Long paidInvoices;                // 支払済請求書数
  private BigDecimal totalInvoiceAmount;    // 総請求金額

  // ステータス別の手数料内訳
  private Map<String, BigDecimal> commissionByStatus;

  // ステータス別の請求書内訳
  private Map<String, Long> invoiceCountByStatus;
}
