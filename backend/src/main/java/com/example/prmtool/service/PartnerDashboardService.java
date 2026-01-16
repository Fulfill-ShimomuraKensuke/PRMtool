package com.example.prmtool.service;

import com.example.prmtool.dto.PartnerDashboardResponse;
import com.example.prmtool.entity.Commission;
import com.example.prmtool.entity.Invoice;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.Project;
import com.example.prmtool.repository.CommissionRepository;
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

@Service
@RequiredArgsConstructor
public class PartnerDashboardService {

  private final PartnerRepository partnerRepository;
  private final ProjectRepository projectRepository;
  private final CommissionRepository commissionRepository;
  private final InvoiceRepository invoiceRepository;

  // パートナー別ダッシュボードデータを取得
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

    // 手数料統計を計算
    BigDecimal totalCommission = commissionRepository.sumAmountByPartnerId(partnerId);
    BigDecimal pendingCommission = commissionRepository.sumAmountByPartnerIdAndStatus(
        partnerId, Commission.CommissionStatus.PENDING);
    BigDecimal approvedCommission = commissionRepository.sumAmountByPartnerIdAndStatus(
        partnerId, Commission.CommissionStatus.APPROVED);
    BigDecimal paidCommission = commissionRepository.sumAmountByPartnerIdAndStatus(
        partnerId, Commission.CommissionStatus.PAID);

    // ステータス別手数料内訳
    Map<String, BigDecimal> commissionByStatus = new HashMap<>();
    commissionByStatus.put("未承認", pendingCommission);
    commissionByStatus.put("承認済", approvedCommission);
    commissionByStatus.put("支払済", paidCommission);

    // 請求書統計を計算
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
        .totalProjects(totalProjects)
        .activeProjects(activeProjects)
        .completedProjects(completedProjects)
        .totalCommission(totalCommission)
        .pendingCommission(pendingCommission)
        .approvedCommission(approvedCommission)
        .paidCommission(paidCommission)
        .commissionByStatus(commissionByStatus)
        .totalInvoices(totalInvoices)
        .draftInvoices(draftInvoices)
        .issuedInvoices(issuedInvoices)
        .paidInvoices(paidInvoices)
        .totalInvoiceAmount(totalInvoiceAmount)
        .invoiceCountByStatus(invoiceCountByStatus)
        .build();
  }
}
