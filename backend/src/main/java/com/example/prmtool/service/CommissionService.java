package com.example.prmtool.service;

import com.example.prmtool.dto.CommissionRequest;
import com.example.prmtool.dto.CommissionResponse;
import com.example.prmtool.entity.Commission;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.Project;
import com.example.prmtool.repository.CommissionRepository;
import com.example.prmtool.repository.PartnerRepository;
import com.example.prmtool.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommissionService {

  private final CommissionRepository commissionRepository;
  private final ProjectRepository projectRepository;
  private final PartnerRepository partnerRepository;

  // 手数料一覧を取得
  @Transactional(readOnly = true)
  public List<CommissionResponse> getAllCommissions() {
    return commissionRepository.findAll().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // 手数料IDで取得
  @Transactional(readOnly = true)
  public CommissionResponse getCommissionById(UUID id) {
    Commission commission = commissionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("手数料が見つかりません"));
    return convertToResponse(commission);
  }

  // 案件IDで手数料を取得
  @Transactional(readOnly = true)
  public List<CommissionResponse> getCommissionsByProjectId(UUID projectId) {
    return commissionRepository.findByProjectId(projectId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // パートナーIDで手数料を取得
  @Transactional(readOnly = true)
  public List<CommissionResponse> getCommissionsByPartnerId(UUID partnerId) {
    return commissionRepository.findByPartnerId(partnerId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // ステータスで手数料を取得
  @Transactional(readOnly = true)
  public List<CommissionResponse> getCommissionsByStatus(Commission.CommissionStatus status) {
    return commissionRepository.findByStatus(status).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  // 手数料を作成
  @Transactional
  public CommissionResponse createCommission(CommissionRequest request) {
    // 案件とパートナーを取得
    Project project = projectRepository.findById(request.getProjectId())
        .orElseThrow(() -> new RuntimeException("案件が見つかりません"));
    Partner partner = partnerRepository.findById(request.getPartnerId())
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません"));

    // 手数料金額を計算（基準金額 × 手数料率 / 100）
    BigDecimal amount = request.getBaseAmount()
        .multiply(request.getRate())
        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

    // 手数料エンティティを作成
    Commission commission = Commission.builder()
        .project(project)
        .partner(partner)
        .baseAmount(request.getBaseAmount())
        .rate(request.getRate())
        .amount(amount)
        .status(request.getStatus())
        .paymentDate(request.getPaymentDate())
        .notes(request.getNotes())
        .build();

    Commission saved = commissionRepository.save(commission);
    return convertToResponse(saved);
  }

  // 手数料を更新
  @Transactional
  public CommissionResponse updateCommission(UUID id, CommissionRequest request) {
    Commission commission = commissionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("手数料が見つかりません"));

    // 案件とパートナーを取得
    Project project = projectRepository.findById(request.getProjectId())
        .orElseThrow(() -> new RuntimeException("案件が見つかりません"));
    Partner partner = partnerRepository.findById(request.getPartnerId())
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません"));

    // 手数料金額を再計算
    BigDecimal amount = request.getBaseAmount()
        .multiply(request.getRate())
        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

    // 更新
    commission.setProject(project);
    commission.setPartner(partner);
    commission.setBaseAmount(request.getBaseAmount());
    commission.setRate(request.getRate());
    commission.setAmount(amount);
    commission.setStatus(request.getStatus());
    commission.setPaymentDate(request.getPaymentDate());
    commission.setNotes(request.getNotes());

    Commission updated = commissionRepository.save(commission);
    return convertToResponse(updated);
  }

  // 手数料を削除
  @Transactional
  public void deleteCommission(UUID id) {
    if (!commissionRepository.existsById(id)) {
      throw new RuntimeException("手数料が見つかりません");
    }
    commissionRepository.deleteById(id);
  }

  // パートナーIDで手数料の合計金額を取得
  @Transactional(readOnly = true)
  public BigDecimal getTotalCommissionByPartnerId(UUID partnerId) {
    return commissionRepository.sumAmountByPartnerId(partnerId);
  }

  // パートナーIDとステータスで手数料の合計金額を取得
  @Transactional(readOnly = true)
  public BigDecimal getTotalCommissionByPartnerIdAndStatus(UUID partnerId, Commission.CommissionStatus status) {
    return commissionRepository.sumAmountByPartnerIdAndStatus(partnerId, status);
  }

  // エンティティをレスポンスDTOに変換
  private CommissionResponse convertToResponse(Commission commission) {
    return CommissionResponse.builder()
        .id(commission.getId())
        .projectId(commission.getProject().getId())
        .projectName(commission.getProject().getName())
        .partnerId(commission.getPartner().getId())
        .partnerName(commission.getPartner().getName())
        .baseAmount(commission.getBaseAmount())
        .rate(commission.getRate())
        .amount(commission.getAmount())
        .status(commission.getStatus())
        .statusLabel(CommissionResponse.getStatusLabel(commission.getStatus()))
        .paymentDate(commission.getPaymentDate())
        .notes(commission.getNotes())
        .createdAt(commission.getCreatedAt())
        .updatedAt(commission.getUpdatedAt())
        .build();
  }
}
