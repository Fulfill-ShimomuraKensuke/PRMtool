package com.example.prmtool.controller;

import com.example.prmtool.dto.PartnerRequest;
import com.example.prmtool.dto.PartnerResponse;
import com.example.prmtool.service.PartnerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    // 作成：ADMINのみ
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartnerResponse> createPartner(@Valid @RequestBody PartnerRequest request) {
        PartnerResponse response = partnerService.createPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 一覧：ログインしてればOK
    @GetMapping
    public ResponseEntity<List<PartnerResponse>> getAllPartners() {
        List<PartnerResponse> partners = partnerService.getAllPartners();
        return ResponseEntity.ok(partners);
    }

    // 詳細：ログインしてればOK
    @GetMapping("/{id}")
    public ResponseEntity<PartnerResponse> getPartnerById(@PathVariable UUID id) {
        PartnerResponse response = partnerService.getPartnerById(id);
        return ResponseEntity.ok(response);
    }

    // 更新：ADMINのみ
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartnerResponse> updatePartner(
            @PathVariable UUID id,
            @Valid @RequestBody PartnerRequest request) {
        PartnerResponse response = partnerService.updatePartner(id, request);
        return ResponseEntity.ok(response);
    }

    // 削除：ADMINのみ
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePartner(@PathVariable UUID id) {
        partnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }
}