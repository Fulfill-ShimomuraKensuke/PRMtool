package com.example.prmtool.controller;

import com.example.prmtool.dto.InvoiceTemplateRequest;
import com.example.prmtool.dto.InvoiceTemplateResponse;
import com.example.prmtool.entity.InvoiceTemplate;
import com.example.prmtool.repository.InvoiceTemplateRepository;
import com.example.prmtool.service.InvoiceTemplateService;
import com.example.prmtool.service.PdfGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * InvoiceTemplateコントローラー
 * 請求書テンプレートのCRUD操作APIを提供
 */
@RestController
@RequestMapping("/api/invoice-templates")
@RequiredArgsConstructor
public class InvoiceTemplateController {

    private final InvoiceTemplateService templateService;
    private final PdfGeneratorService pdfGeneratorService;
    private final InvoiceTemplateRepository templateRepository;

    /**
     * 全テンプレートを取得
     * 管理者と担当者がアクセス可能
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InvoiceTemplateResponse>> getAllTemplates() {
        List<InvoiceTemplateResponse> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    /**
     * テンプレートIDで取得
     * 特定のテンプレート詳細を返す
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InvoiceTemplateResponse> getTemplateById(@PathVariable UUID id) {
        InvoiceTemplateResponse template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    /**
     * デフォルトテンプレートを取得
     * システムのデフォルトテンプレートを返す
     */
    @GetMapping("/default")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InvoiceTemplateResponse> getDefaultTemplate() {
        InvoiceTemplateResponse template = templateService.getDefaultTemplate();
        return ResponseEntity.ok(template);
    }

    /**
     * テンプレートを作成
     * 新しい請求書テンプレートを登録
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InvoiceTemplateResponse> createTemplate(
            @Valid @RequestBody InvoiceTemplateRequest request,
            Authentication authentication) {
        String loginId = authentication.getName();
        InvoiceTemplateResponse created = templateService.createTemplate(request, loginId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * テンプレートを更新
     * 既存テンプレートの内容を変更
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InvoiceTemplateResponse> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody InvoiceTemplateRequest request,
            Authentication authentication) {
        String loginId = authentication.getName();
        InvoiceTemplateResponse updated = templateService.updateTemplate(id, request, loginId);
        return ResponseEntity.ok(updated);
    }

    /**
     * テンプレートを削除
     * 指定されたテンプレートを削除（管理者のみ）
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * デフォルトテンプレートに設定
     * 指定したテンプレートをデフォルトとして設定（管理者のみ）
     */
    @PutMapping("/{id}/set-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceTemplateResponse> setAsDefault(@PathVariable UUID id) {
        InvoiceTemplateResponse updated = templateService.setAsDefault(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * テンプレートのプレビューPDFを生成
     * サンプルデータを使用してテンプレートのデザインを確認
     */
    @GetMapping("/{id}/preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<byte[]> generatePreviewPdf(@PathVariable UUID id) {
        InvoiceTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("テンプレートが見つかりません: " + id));

        byte[] pdfBytes = pdfGeneratorService.generatePreviewPdf(template);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "preview_" + template.getTemplateName() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}