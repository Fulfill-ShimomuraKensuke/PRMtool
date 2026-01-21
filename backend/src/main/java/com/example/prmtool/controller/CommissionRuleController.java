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
 * Controller は薄く、ビジネスロジックは Service に集約
 */
@RestController
@RequestMapping("/api/commission-rules")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CommissionRuleController {

  private final CommissionRuleService commissionRuleService;

  /**
   * 全手数料ルールを取得
   */
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionRuleResponse>> getAllRules() {
    List<CommissionRuleResponse> rules = commissionRuleService.getAllRules();
    return ResponseEntity.ok(rules);
  }

  /**
   * IDで手数料ルールを取得
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<CommissionRuleResponse> getRuleById(@PathVariable UUID id) {
    CommissionRuleResponse rule = commissionRuleService.getRuleById(id);
    return ResponseEntity.ok(rule);
  }

  /**
   * 案件IDで手数料ルールを取得
   */
  @GetMapping("/by-project/{projectId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionRuleResponse>> getRulesByProjectId(@PathVariable UUID projectId) {
    List<CommissionRuleResponse> rules = commissionRuleService.getRulesByProjectId(projectId);
    return ResponseEntity.ok(rules);
  }

  /**
   * 請求書で使用可能な手数料ルールを取得（確定状態のみ）
   */
  @GetMapping("/usable/by-project/{projectId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionRuleResponse>> getUsableRulesByProjectId(@PathVariable UUID projectId) {
    List<CommissionRuleResponse> rules = commissionRuleService.getUsableRulesByProjectId(projectId);
    return ResponseEntity.ok(rules);
  }

  /**
   * 手数料ルールを作成
   */
  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CommissionRuleResponse> createRule(@Valid @RequestBody CommissionRuleRequest request) {
    CommissionRuleResponse created = commissionRuleService.createRule(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /**
   * 手数料ルールを更新
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CommissionRuleResponse> updateRule(
      @PathVariable UUID id,
      @Valid @RequestBody CommissionRuleRequest request) {
    CommissionRuleResponse updated = commissionRuleService.updateRule(id, request);
    return ResponseEntity.ok(updated);
  }

  /**
   * ステータスを変更
   */
  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CommissionRuleResponse> updateStatus(
      @PathVariable UUID id,
      @RequestParam CommissionRule.CommissionStatus status) {
    CommissionRuleResponse updated = commissionRuleService.updateStatus(id, status);
    return ResponseEntity.ok(updated);
  }

  /**
   * 手数料ルールを削除
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
    commissionRuleService.deleteRule(id);
    return ResponseEntity.noContent().build();
  }
}