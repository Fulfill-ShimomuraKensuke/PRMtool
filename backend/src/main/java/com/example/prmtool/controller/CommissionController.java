package com.example.prmtool.controller;

import com.example.prmtool.dto.CommissionRequest;
import com.example.prmtool.dto.CommissionResponse;
import com.example.prmtool.entity.Commission;
import com.example.prmtool.service.CommissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/commissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CommissionController {

  private final CommissionService commissionService;

  // 手数料一覧を取得
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionResponse>> getAllCommissions() {
    List<CommissionResponse> commissions = commissionService.getAllCommissions();
    return ResponseEntity.ok(commissions);
  }

  // 手数料IDで取得
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<CommissionResponse> getCommissionById(@PathVariable UUID id) {
    CommissionResponse commission = commissionService.getCommissionById(id);
    return ResponseEntity.ok(commission);
  }

  // 案件IDで手数料を取得
  @GetMapping("/project/{projectId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionResponse>> getCommissionsByProjectId(@PathVariable UUID projectId) {
    List<CommissionResponse> commissions = commissionService.getCommissionsByProjectId(projectId);
    return ResponseEntity.ok(commissions);
  }

  // パートナーIDで手数料を取得
  @GetMapping("/partner/{partnerId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionResponse>> getCommissionsByPartnerId(@PathVariable UUID partnerId) {
    List<CommissionResponse> commissions = commissionService.getCommissionsByPartnerId(partnerId);
    return ResponseEntity.ok(commissions);
  }

  // ステータスで手数料を取得
  @GetMapping("/status/{status}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<List<CommissionResponse>> getCommissionsByStatus(@PathVariable Commission.CommissionStatus status) {
    List<CommissionResponse> commissions = commissionService.getCommissionsByStatus(status);
    return ResponseEntity.ok(commissions);
  }

  // 手数料を作成
  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CommissionResponse> createCommission(@Valid @RequestBody CommissionRequest request) {
    CommissionResponse created = commissionService.createCommission(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // 手数料を更新
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CommissionResponse> updateCommission(
      @PathVariable UUID id,
      @Valid @RequestBody CommissionRequest request) {
    CommissionResponse updated = commissionService.updateCommission(id, request);
    return ResponseEntity.ok(updated);
  }

  // 手数料を削除
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteCommission(@PathVariable UUID id) {
    commissionService.deleteCommission(id);
    return ResponseEntity.noContent().build();
  }

  // パートナーIDで手数料の合計金額を取得
  @GetMapping("/partner/{partnerId}/total")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<BigDecimal> getTotalCommissionByPartnerId(@PathVariable UUID partnerId) {
    BigDecimal total = commissionService.getTotalCommissionByPartnerId(partnerId);
    return ResponseEntity.ok(total);
  }

  // パートナーIDとステータスで手数料の合計金額を取得
  @GetMapping("/partner/{partnerId}/total/{status}")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<BigDecimal> getTotalCommissionByPartnerIdAndStatus(
      @PathVariable UUID partnerId,
      @PathVariable Commission.CommissionStatus status) {
    BigDecimal total = commissionService.getTotalCommissionByPartnerIdAndStatus(partnerId, status);
    return ResponseEntity.ok(total);
  }
}
