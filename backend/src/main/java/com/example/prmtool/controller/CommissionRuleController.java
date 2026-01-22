package com.example.prmtool.controller;

import com.example.prmtool.dto.CommissionRuleRequest;
import com.example.prmtool.dto.CommissionRuleResponse;
import com.example.prmtool.entity.CommissionRule;
import com.example.prmtool.service.CommissionRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 手数料ルールController
 * ACCOUNTING権限を追加：作成・編集・確定が可能（削除は不可）
 */
@RestController
@RequestMapping("/api/commission-rules")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CommissionRuleController {

  private final CommissionRuleService commissionRuleService;

  /**
   * 全手数料ルールを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<CommissionRuleResponse>> getAllRules() {
    List<CommissionRuleResponse> rules = commissionRuleService.getAllRules();
    return ResponseEntity.ok(rules);
  }

  /**
   * IDで手数料ルールを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<CommissionRuleResponse> getRuleById(@PathVariable UUID id) {
    CommissionRuleResponse rule = commissionRuleService.getRuleById(id);
    return ResponseEntity.ok(rule);
  }

  /**
   * 案件IDで手数料ルールを取得
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/by-project/{projectId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<CommissionRuleResponse>> getRulesByProjectId(@PathVariable UUID projectId) {
    List<CommissionRuleResponse> rules = commissionRuleService.getRulesByProjectId(projectId);
    return ResponseEntity.ok(rules);
  }

  /**
   * 請求書で使用可能な手数料ルールを取得（確定状態のみ）
   * 権限: ADMIN, ACCOUNTING, REP
   */
  @GetMapping("/usable/by-project/{projectId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING', 'REP')")
  public ResponseEntity<List<CommissionRuleResponse>> getUsableRulesByProjectId(@PathVariable UUID projectId) {
    List<CommissionRuleResponse> rules = commissionRuleService.getUsableRulesByProjectId(projectId);
    return ResponseEntity.ok(rules);
  }

  /**
   * 手数料ルールを作成
   * 権限: ADMIN, ACCOUNTING
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<CommissionRuleResponse> createRule(@Valid @RequestBody CommissionRuleRequest request) {
    CommissionRuleResponse created = commissionRuleService.createRule(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * 手数料ルールを更新
   * 権限: ADMIN, ACCOUNTING
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<CommissionRuleResponse> updateRule(
      @PathVariable UUID id,
      @Valid @RequestBody CommissionRuleRequest request) {
    CommissionRuleResponse updated = commissionRuleService.updateRule(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * ステータスを変更（確定処理を含む）
   * 権限: ADMIN, ACCOUNTING
   */
  @PatchMapping("/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTING')")
  public ResponseEntity<CommissionRuleResponse> updateStatus(
      @PathVariable UUID id,
      @RequestParam CommissionRule.CommissionStatus status) {
    CommissionRuleResponse updated = commissionRuleService.updateStatus(id, status);
    return ResponseEntity.ok(updated);
  }

  /**
   * 手数料ルールを削除
   * 権限: ADMIN のみ
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
    commissionRuleService.deleteRule(id);
    return ResponseEntity.noContent().build();
  }
}