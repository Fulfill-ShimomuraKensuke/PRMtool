package com.example.prmtool.service;

import com.example.prmtool.dto.PartnerContactDTO;
import com.example.prmtool.dto.PartnerRequest;
import com.example.prmtool.dto.PartnerResponse;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.PartnerContact;
import com.example.prmtool.repository.PartnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PartnerService {

  private final PartnerRepository partnerRepository; // パートナーリポジトリ

  public PartnerService(PartnerRepository partnerRepository) {
    this.partnerRepository = partnerRepository;
  }

  // パートナー作成
  @Transactional
  public PartnerResponse createPartner(PartnerRequest request) {
    // 1. Partnerエンティティを作成
    Partner partner = Partner.builder()
        .name(request.getName())
        .phone(request.getPhone())
        .address(request.getAddress())
        .build();

    // 2. 担当者を追加
    if (request.getContacts() != null && !request.getContacts().isEmpty()) {
      for (PartnerContactDTO contactDTO : request.getContacts()) {
        PartnerContact contact = PartnerContact.builder()
            .contactName(contactDTO.getContactName())
            .contactInfo(contactDTO.getContactInfo())
            .build();
        partner.addContact(contact);
      }
    }

    // 3. 保存
    Partner savedPartner = partnerRepository.save(Objects.requireNonNull(partner));
    return PartnerResponse.from(savedPartner);
  }

  // 全パートナー取得
  @Transactional(readOnly = true)
  public List<PartnerResponse> getAllPartners() {
    return partnerRepository.findAll().stream()
        .map(PartnerResponse::from)
        .collect(Collectors.toList());
  }

  // パートナー詳細取得
  @Transactional(readOnly = true)
  public PartnerResponse getPartnerById(UUID id) {
    Partner partner = partnerRepository.findById(Objects.requireNonNull(id))
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + id));
    return PartnerResponse.from(partner);
  }

  // パートナー更新
  @Transactional
  public PartnerResponse updatePartner(UUID id, PartnerRequest request) {
    Partner partner = partnerRepository.findById(Objects.requireNonNull(id))
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + id));

    // 基本情報を更新
    partner.setName(request.getName());
    partner.setPhone(request.getPhone());
    partner.setAddress(request.getAddress());

    // 担当者を更新（既存を削除して新規追加）
    partner.getContacts().clear();

    if (request.getContacts() != null && !request.getContacts().isEmpty()) {
      for (PartnerContactDTO contactDTO : request.getContacts()) {
        PartnerContact contact = PartnerContact.builder()
            .contactName(contactDTO.getContactName())
            .contactInfo(contactDTO.getContactInfo())
            .build();
        partner.addContact(contact);
      }
    }

    Partner updatedPartner = partnerRepository.save(partner);
    return PartnerResponse.from(updatedPartner);
  }

  // パートナー削除
  @Transactional
  public void deletePartner(UUID id) {
    if (!partnerRepository.existsById(Objects.requireNonNull(id))) {
      throw new RuntimeException("パートナーが見つかりません: " + id);
    }
    partnerRepository.deleteById(Objects.requireNonNull(id));
  }
}