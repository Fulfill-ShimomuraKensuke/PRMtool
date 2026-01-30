package com.example.prmtool.service;

import com.example.prmtool.dto.PartnerContactDTO;
import com.example.prmtool.dto.PartnerRequest;
import com.example.prmtool.dto.PartnerResponse;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.PartnerContact;
import com.example.prmtool.repository.PartnerRepository;
import com.example.prmtool.validator.ContactInfoValidator;
import com.example.prmtool.validator.DuplicatePartnerNameValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * パートナーサービス
 * パートナー企業の業務ロジック層
 */
@Service
@RequiredArgsConstructor
public class PartnerService {

  private final PartnerRepository partnerRepository;
  private final DuplicatePartnerNameValidator nameValidator;
  private final ContactInfoValidator contactValidator;

  /**
   * 全パートナーを取得
   */
  @Transactional(readOnly = true)
  public List<PartnerResponse> getAllPartners() {
    return partnerRepository.findAll().stream()
        .map(PartnerResponse::from)
        .collect(Collectors.toList());
  }

  /**
   * IDでパートナーを取得
   */
  @Transactional(readOnly = true)
  public PartnerResponse getPartnerById(UUID id) {
    Partner partner = partnerRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + id));
    return PartnerResponse.from(partner);
  }

  /**
   * パートナーを作成
   * 企業名の重複チェックと担当者の連絡先バリデーションを実施
   */
  @Transactional
  public PartnerResponse createPartner(PartnerRequest request) {
    // 企業名の重複チェック
    nameValidator.validate(request.getName());

    // Partnerエンティティを作成
    Partner partner = Partner.builder()
        .name(request.getName())
        .industry(request.getIndustry())
        .phone(request.getPhone())
        .postalCode(request.getPostalCode())
        .address(request.getAddress())
        .email(request.getEmail())
        .build();

    // 担当者を追加
    if (request.getContacts() != null && !request.getContacts().isEmpty()) {
      for (PartnerContactDTO contactDTO : request.getContacts()) {
        // 連絡先情報のバリデーション（電話番号またはメールアドレス必須）
        contactValidator.validate(
            contactDTO.getPhone(),
            contactDTO.getEmail(),
            contactDTO.getContactName());

        PartnerContact contact = PartnerContact.builder()
            .contactName(contactDTO.getContactName())
            .phone(contactDTO.getPhone())
            .email(contactDTO.getEmail())
            .build();
        partner.addContact(contact);
      }
    }

    // 保存して返却
    Partner savedPartner = partnerRepository.save(partner);
    return PartnerResponse.from(savedPartner);
  }

  /**
   * パートナーを更新
   * 企業名の重複チェック（自分自身は除外）と担当者の連絡先バリデーションを実施
   */
  @Transactional
  public PartnerResponse updatePartner(UUID id, PartnerRequest request) {
    Partner partner = partnerRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + id));

    // 企業名の重複チェック（自分自身は除外）
    nameValidator.validate(request.getName(), id);

    // 基本情報を更新
    partner.setName(request.getName());
    partner.setIndustry(request.getIndustry());
    partner.setPhone(request.getPhone());
    partner.setPostalCode(request.getPostalCode());
    partner.setAddress(request.getAddress());
    partner.setEmail(request.getEmail());

    // 既存の担当者をクリア
    partner.getContacts().clear();

    // 新しい担当者を追加
    if (request.getContacts() != null && !request.getContacts().isEmpty()) {
      for (PartnerContactDTO contactDTO : request.getContacts()) {
        // 連絡先情報のバリデーション
        contactValidator.validate(
            contactDTO.getPhone(),
            contactDTO.getEmail(),
            contactDTO.getContactName());

        PartnerContact contact = PartnerContact.builder()
            .contactName(contactDTO.getContactName())
            .phone(contactDTO.getPhone())
            .email(contactDTO.getEmail())
            .build();
        partner.addContact(contact);
      }
    }

    // 保存して返却
    Partner updatedPartner = partnerRepository.save(partner);
    return PartnerResponse.from(updatedPartner);
  }

  /**
   * パートナーを削除
   */
  @Transactional
  public void deletePartner(UUID id) {
    if (!partnerRepository.existsById(id)) {
      throw new RuntimeException("パートナーが見つかりません: " + id);
    }
    partnerRepository.deleteById(id);
  }
}