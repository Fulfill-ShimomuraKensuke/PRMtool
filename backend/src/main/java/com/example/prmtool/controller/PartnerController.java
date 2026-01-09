package com.example.prmtool.controller;

import com.example.prmtool.dto.PartnerRequest;
import com.example.prmtool.dto.PartnerResponse;
import com.example.prmtool.service.PartnerService;
import com.example.prmtool.service.PartnerCsvService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class PartnerController {

  private final PartnerService partnerService;
  private final PartnerCsvService partnerCsvService;

  public PartnerController(PartnerService partnerService,
      PartnerCsvService partnerCsvService) {
    this.partnerService = partnerService;
    this.partnerCsvService = partnerCsvService;
  }

  @GetMapping
  public ResponseEntity<List<PartnerResponse>> getAllPartners() {
    List<PartnerResponse> partners = partnerService.getAllPartners();
    return ResponseEntity.ok(partners);
  }

  @GetMapping("/{id}")
  public ResponseEntity<PartnerResponse> getPartnerById(@PathVariable UUID id) {
    PartnerResponse partner = partnerService.getPartnerById(id);
    return ResponseEntity.ok(partner);
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PartnerResponse> createPartner(@Valid @RequestBody PartnerRequest request) {
    PartnerResponse response = partnerService.createPartner(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PartnerResponse> updatePartner(
      @PathVariable UUID id,
      @Valid @RequestBody PartnerRequest request) {
    PartnerResponse response = partnerService.updatePartner(id, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deletePartner(@PathVariable UUID id) {
    partnerService.deletePartner(id);
    return ResponseEntity.noContent().build();
  }

  // CSVインポートエンドポイント
  @PostMapping("/import-csv")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) {
    try {
      if (file.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "ファイルが空です"));
      }

      Map<String, Object> result = partnerCsvService.importPartnersFromCsv(file);
      return ResponseEntity.ok(result);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "インポート中にエラーが発生しました: " + e.getMessage()));
    }
  }
}