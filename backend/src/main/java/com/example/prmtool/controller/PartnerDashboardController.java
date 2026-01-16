package com.example.prmtool.controller;

import com.example.prmtool.dto.PartnerDashboardResponse;
import com.example.prmtool.service.PartnerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PartnerDashboardController {

  private final PartnerDashboardService partnerDashboardService;

  // パートナー別ダッシュボードを取得
  @GetMapping("/{partnerId}/dashboard")
  @PreAuthorize("hasAnyRole('ADMIN', 'REP')")
  public ResponseEntity<PartnerDashboardResponse> getPartnerDashboard(@PathVariable UUID partnerId) {
    PartnerDashboardResponse dashboard = partnerDashboardService.getPartnerDashboard(partnerId);
    return ResponseEntity.ok(dashboard);
  }
}
