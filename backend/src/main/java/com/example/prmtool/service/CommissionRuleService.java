package com.example.prmtool.service;

import com.example.prmtool.dto.CommissionRuleRequest;
import com.example.prmtool.dto.CommissionRuleResponse;
import com.example.prmtool.entity.CommissionRule;
import com.example.prmtool.entity.Project;
import com.example.prmtool.repository.CommissionRuleRepository;
import com.example.prmtool.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 手数料ルールサービス
 * 業務ロジックをControllerから分離し、CRUD操作を管理
 */
@Service
@RequiredArgsConstructor
public class CommissionRuleService {

  private final CommissionRuleRepository commissionRuleRepository;
  private final ProjectRepository projectRepository;

  /**
   * 全手数料ルールを取得
   */
  @Transactional(readOnly = true)
  public List<CommissionRuleResponse> getAllRules() {
    return commissionRuleRepository.findAllByOrderByCreatedAtAsc().stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * IDで手数料ルールを取得
   */
  @Transactional(readOnly = true)
  public CommissionRuleResponse getRuleById(UUID id) {
    CommissionRule rule = commissionRuleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("手数料ルールが見つかりません: " + id));
    return convertToResponse(rule);
  }

  /**
   * 案件IDで手数料ルールを取得
   */
  @Transactional(readOnly = true)
  public List<CommissionRuleResponse> getRulesByProjectId(UUID projectId) {
    return commissionRuleRepository.findByProjectId(projectId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 請求書で使用可能な手数料ルールを取得（確定状態のみ）
   */
  @Transactional(readOnly = true)
  public List<CommissionRuleResponse> getUsableRulesByProjectId(UUID projectId) {
    return commissionRuleRepository.findUsableRulesByProjectId(projectId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 手数料ルールを作成
   */
  @Transactional
  public CommissionRuleResponse createRule(CommissionRuleRequest request) {
    // 案件を取得
    Project project = projectRepository.findById(request.getProjectId())
        .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + request.getProjectId()));

    // エンティティを作成
    CommissionRule rule = CommissionRule.builder()
        .project(project)
        .ruleName(request.getRuleName())
        .commissionType(request.getCommissionType())
        .ratePercent(request.getRatePercent())
        .fixedAmount(request.getFixedAmount())
        .status(request.getStatus())
        .notes(request.getNotes())
        .build();

    CommissionRule saved = commissionRuleRepository.save(rule);
    return convertToResponse(saved);
  }

  /**
   * 手数料ルールを更新
   */
  @Transactional
  public CommissionRuleResponse updateRule(UUID id, CommissionRuleRequest request) {
    CommissionRule rule = commissionRuleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("手数料ルールが見つかりません: " + id));

    // 案件を取得
    Project project = projectRepository.findById(request.getProjectId())
        .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + request.getProjectId()));

    // 更新
    rule.setProject(project);
    rule.setRuleName(request.getRuleName());
    rule.setCommissionType(request.getCommissionType());
    rule.setRatePercent(request.getRatePercent());
    rule.setFixedAmount(request.getFixedAmount());
    rule.setStatus(request.getStatus());
    rule.setNotes(request.getNotes());

    CommissionRule updated = commissionRuleRepository.save(rule);
    return convertToResponse(updated);
  }

  /**
   * ステータスを変更
   */
  @Transactional
  public CommissionRuleResponse updateStatus(UUID id, CommissionRule.CommissionStatus status) {
    CommissionRule rule = commissionRuleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("手数料ルールが見つかりません: " + id));

    rule.setStatus(status);
    CommissionRule updated = commissionRuleRepository.save(rule);
    return convertToResponse(updated);
  }

  /**
   * 手数料ルールを削除
   */
  @Transactional
  public void deleteRule(UUID id) {
    if (!commissionRuleRepository.existsById(id)) {
      throw new RuntimeException("手数料ルールが見つかりません: " + id);
    }
    commissionRuleRepository.deleteById(id);
  }

  /**
   * エンティティをレスポンスDTOに変換
   * 案件のパートナー情報を含める（フロントエンドでの整合性チェック用）
   */
  private CommissionRuleResponse convertToResponse(CommissionRule rule) {
    return CommissionRuleResponse.builder()
        .id(rule.getId())
        .projectId(rule.getProject().getId())
        .projectName(rule.getProject().getName())
        .projectPartnerId(rule.getProject().getPartner().getId()) // ★追加
        .projectPartnerName(rule.getProject().getPartner().getName()) // ★追加
        .ruleName(rule.getRuleName())
        .commissionType(rule.getCommissionType())
        .ratePercent(rule.getRatePercent())
        .fixedAmount(rule.getFixedAmount())
        .status(rule.getStatus())
        .notes(rule.getNotes())
        .createdAt(rule.getCreatedAt())
        .updatedAt(rule.getUpdatedAt())
        .build();
  }
}
