package com.example.prmtool.service;

import com.example.prmtool.dto.InvoiceTemplateRequest;
import com.example.prmtool.dto.InvoiceTemplateResponse;
import com.example.prmtool.entity.InvoiceTemplate;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.InvoiceTemplateRepository;
import com.example.prmtool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * InvoiceTemplateサービス
 * 請求書テンプレートの管理ロジックを実装
 */
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceTemplateService {

  private final InvoiceTemplateRepository templateRepository;
  private final UserRepository userRepository;

  /**
   * 全テンプレートを取得
   * 作成日時の降順で返却
   */
  @Transactional(readOnly = true)
  public List<InvoiceTemplateResponse> getAllTemplates() {
    return templateRepository.findAllByOrderByCreatedAtDesc()
        .stream()
        .map(InvoiceTemplateResponse::from)
        .collect(Collectors.toList());
  }

  /**
   * テンプレートIDで取得
   * 指定されたIDのテンプレートを返す
   */
  @Transactional(readOnly = true)
  public InvoiceTemplateResponse getTemplateById(UUID id) {
    InvoiceTemplate template = templateRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("テンプレートが見つかりません: " + id));
    return InvoiceTemplateResponse.from(template);
  }

  /**
   * デフォルトテンプレートを取得
   * システムで使用するデフォルトテンプレートを返す
   */
  @Transactional(readOnly = true)
  public InvoiceTemplateResponse getDefaultTemplate() {
    InvoiceTemplate template = templateRepository.findByIsDefaultTrue()
        .orElseThrow(() -> new RuntimeException("デフォルトテンプレートが設定されていません"));
    return InvoiceTemplateResponse.from(template);
  }

  /**
   * テンプレートを作成
   * 新しいテンプレートを保存し、デフォルト設定を管理
   */
  public InvoiceTemplateResponse createTemplate(InvoiceTemplateRequest request, String loginId) {
    // 作成者ユーザーを取得
    User creator = userRepository.findByLoginId(loginId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + loginId));

    // テンプレート名の重複チェック
    if (templateRepository.findByTemplateName(request.getTemplateName()).isPresent()) {
      throw new RuntimeException("同じ名前のテンプレートが既に存在します: " + request.getTemplateName());
    }

    // デフォルト設定の処理
    if (Boolean.TRUE.equals(request.getIsDefault())) {
      // 既存のデフォルトテンプレートを解除
      templateRepository.findByIsDefaultTrue().ifPresent(existingDefault -> {
        existingDefault.setIsDefault(false);
        templateRepository.save(existingDefault);
      });
    }

    // テンプレートエンティティを作成
    InvoiceTemplate template = InvoiceTemplate.builder()
        .templateName(request.getTemplateName())
        .description(request.getDescription())
        .logoUrl(request.getLogoUrl())
        .companyName(request.getCompanyName())
        .companyAddress(request.getCompanyAddress())
        .companyPhone(request.getCompanyPhone())
        .companyEmail(request.getCompanyEmail())
        .companyWebsite(request.getCompanyWebsite())
        .layoutSettings(request.getLayoutSettings())
        .primaryColor(request.getPrimaryColor())
        .secondaryColor(request.getSecondaryColor())
        .fontFamily(request.getFontFamily())
        .displaySettings(request.getDisplaySettings())
        .footerText(request.getFooterText())
        .bankInfo(request.getBankInfo())
        .paymentTerms(request.getPaymentTerms())
        .canvasLayout(request.getCanvasLayout())
        .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
        .createdBy(creator)
        .build();

    // 保存
    InvoiceTemplate saved = templateRepository.save(template);
    return InvoiceTemplateResponse.from(saved);
  }

  /**
   * テンプレートを更新
   * 既存テンプレートの内容を変更
   */
  public InvoiceTemplateResponse updateTemplate(UUID id, InvoiceTemplateRequest request, String loginId) {
    // テンプレートを取得
    InvoiceTemplate template = templateRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("テンプレートが見つかりません: " + id));

    // テンプレート名の重複チェック（自分以外で同名が存在するか）
    templateRepository.findByTemplateName(request.getTemplateName())
        .ifPresent(existing -> {
          if (!existing.getId().equals(id)) {
            throw new RuntimeException("同じ名前のテンプレートが既に存在します: " + request.getTemplateName());
          }
        });

    // デフォルト設定の処理
    if (Boolean.TRUE.equals(request.getIsDefault()) && !template.getIsDefault()) {
      // 他のデフォルトテンプレートを解除
      templateRepository.findByIsDefaultTrue().ifPresent(existingDefault -> {
        if (!existingDefault.getId().equals(id)) {
          existingDefault.setIsDefault(false);
          templateRepository.save(existingDefault);
        }
      });
    }

    // テンプレート情報を更新
    template.setTemplateName(request.getTemplateName());
    template.setDescription(request.getDescription());
    template.setLogoUrl(request.getLogoUrl());
    template.setCompanyName(request.getCompanyName());
    template.setCompanyAddress(request.getCompanyAddress());
    template.setCompanyPhone(request.getCompanyPhone());
    template.setCompanyEmail(request.getCompanyEmail());
    template.setCompanyWebsite(request.getCompanyWebsite());
    template.setLayoutSettings(request.getLayoutSettings());
    template.setPrimaryColor(request.getPrimaryColor());
    template.setSecondaryColor(request.getSecondaryColor());
    template.setFontFamily(request.getFontFamily());
    template.setDisplaySettings(request.getDisplaySettings());
    template.setFooterText(request.getFooterText());
    template.setBankInfo(request.getBankInfo());
    template.setPaymentTerms(request.getPaymentTerms());
    template.setCanvasLayout(request.getCanvasLayout());
    template.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

    // 保存
    InvoiceTemplate updated = templateRepository.save(template);
    return InvoiceTemplateResponse.from(updated);
  }

  /**
   * テンプレートを削除
   * デフォルトテンプレートは削除不可
   */
  public void deleteTemplate(UUID id) {
    InvoiceTemplate template = templateRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("テンプレートが見つかりません: " + id));

    // デフォルトテンプレートは削除不可
    if (template.getIsDefault()) {
      throw new RuntimeException("デフォルトテンプレートは削除できません");
    }

    templateRepository.deleteById(id);
  }

  /**
   * デフォルトテンプレートに設定
   * 指定したテンプレートをデフォルトに変更
   */
  public InvoiceTemplateResponse setAsDefault(UUID id) {
    InvoiceTemplate template = templateRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("テンプレートが見つかりません: " + id));

    // 既存のデフォルトテンプレートを解除
    templateRepository.findByIsDefaultTrue().ifPresent(existingDefault -> {
      if (!existingDefault.getId().equals(id)) {
        existingDefault.setIsDefault(false);
        templateRepository.save(existingDefault);
      }
    });

    // 新しくデフォルトに設定
    template.setIsDefault(true);
    InvoiceTemplate updated = templateRepository.save(template);
    return InvoiceTemplateResponse.from(updated);
  }
}