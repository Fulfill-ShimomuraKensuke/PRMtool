package com.example.prmtool.service;

import com.example.prmtool.dto.PartnerDashboardResponse;
import com.example.prmtool.entity.CommissionRule;
import com.example.prmtool.entity.Invoice;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.Project;
import com.example.prmtool.repository.CommissionRuleRepository;
import com.example.prmtool.repository.InvoiceItemRepository;
import com.example.prmtool.repository.InvoiceRepository;
import com.example.prmtool.repository.PartnerRepository;
import com.example.prmtool.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * パートナーダッシュボードサービス
 * 新設計に対応（実績ベース統計）
 */
@Service
@RequiredArgsConstructor
public class PartnerDashboardService {

  private final PartnerRepository partnerRepository;
  private final ProjectRepository projectRepository;
  private final CommissionRuleRepository commissionRuleRepository; // 新: ルール
  private final InvoiceRepository invoiceRepository;
  private final InvoiceItemRepository invoiceItemRepository; // 新: 実績

  /**
   * パートナー別ダッシュボードデータを取得
   */
  @Transactional(readOnly = true)
  public PartnerDashboardResponse getPartnerDashboard(UUID partnerId) {
    // パートナーを取得
    Partner partner = partnerRepository.findById(partnerId)
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません"));

    // 案件統計を計算
    List<Project> projects = projectRepository.findByPartnerId(partnerId);
    long totalProjects = projects.size();
    long activeProjects = projects.stream()
        .filter(p -> p.getStatus() == Project.ProjectStatus.IN_PROGRESS)
        .count();
    long completedProjects = projects.stream()
        .filter(p -> p.getStatus() == Project.ProjectStatus.DONE)
        .count();

    // --- 手数料統計（実績ベース：実際に請求した金額）---
    BigDecimal totalCommission = invoiceItemRepository.sumCommissionByPartnerId(partnerId);
    BigDecimal draftCommission = invoiceItemRepository.sumCommissionByPartnerIdAndInvoiceStatus(
        partnerId, Invoice.InvoiceStatus.DRAFT);
    BigDecimal issuedCommission = invoiceItemRepository.sumCommissionByPartnerIdAndInvoiceStatus(
        partnerId, Invoice.InvoiceStatus.ISSUED);
    BigDecimal paidCommission = invoiceItemRepository.sumCommissionByPartnerIdAndInvoiceStatus(
        partnerId, Invoice.InvoiceStatus.PAID);

    // ステータス別手数料内訳（実績ベース）
    Map<String, BigDecimal> commissionByInvoiceStatus = new HashMap<>();
    commissionByInvoiceStatus.put("下書き", draftCommission);
    commissionByInvoiceStatus.put("発行済", issuedCommission);
    commissionByInvoiceStatus.put("支払済", paidCommission);

    // --- 手数料ルール統計（契約ベース：任意）---
    List<CommissionRule> rules = commissionRuleRepository.findAll().stream()
        .filter(rule -> rule.getProject().getPartner().getId().equals(partnerId))
        .toList();

    long totalCommissionRules = rules.size();
    long confirmedRules = rules.stream()
        .filter(r -> r.getStatus() == CommissionRule.CommissionStatus.CONFIRMED)
        .count();
    long disabledRules = rules.stream()
        .filter(r -> r.getStatus() == CommissionRule.CommissionStatus.DISABLED)
        .count();

    // --- 請求書統計 ---
    List<Invoice> invoices = invoiceRepository.findByPartnerId(partnerId);
    long totalInvoices = invoices.size();
    long draftInvoices = invoices.stream()
        .filter(i -> i.getStatus() == Invoice.InvoiceStatus.DRAFT)
        .count();
    long issuedInvoices = invoices.stream()
        .filter(i -> i.getStatus() == Invoice.InvoiceStatus.ISSUED)
        .count();
    long paidInvoices = invoices.stream()
        .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
        .count();

    BigDecimal totalInvoiceAmount = invoiceRepository.sumTotalAmountByPartnerId(partnerId);

    // ステータス別請求書件数
    Map<String, Long> invoiceCountByStatus = new HashMap<>();
    invoiceCountByStatus.put("下書き", draftInvoices);
    invoiceCountByStatus.put("発行済", issuedInvoices);
    invoiceCountByStatus.put("支払済", paidInvoices);

    // レスポンスを構築
    return PartnerDashboardResponse.builder()
        .partnerId(partner.getId())
        .partnerName(partner.getName())
        .industry(partner.getIndustry())
        // 案件統計
        .totalProjects(totalProjects)
        .activeProjects(activeProjects)
        .completedProjects(completedProjects)
        // 手数料統計（実績ベース）
        .totalCommission(totalCommission)
        .draftCommission(draftCommission)
        .issuedCommission(issuedCommission)
        .paidCommission(paidCommission)
        .commissionByInvoiceStatus(commissionByInvoiceStatus)
        // 手数料ルール統計（契約ベース）
        .totalCommissionRules(totalCommissionRules)
        .confirmedRules(confirmedRules)
        .disabledRules(disabledRules)
        // 請求書統計
        .totalInvoices(totalInvoices)
        .draftInvoices(draftInvoices)
        .issuedInvoices(issuedInvoices)
        .paidInvoices(paidInvoices)
        .totalInvoiceAmount(totalInvoiceAmount)
        .invoiceCountByStatus(invoiceCountByStatus)
        .build();
  }
}