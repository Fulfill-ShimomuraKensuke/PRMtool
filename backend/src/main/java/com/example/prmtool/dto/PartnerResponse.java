package com.example.prmtool.dto;

import com.example.prmtool.entity.Partner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * パートナーレスポンスDTO
 * パートナー企業情報のレスポンス用オブジェクト
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerResponse {

  /**
   * パートナーID
   */
  private UUID id;

  /**
   * 企業名
   */
  private String name;

  /**
   * 業界
   */
  private String industry;

  /**
   * 代表電話
   */
  private String phone;

  /**
   * 郵便番号
   */
  private String postalCode;

  /**
   * 住所
   */
  private String address;

  /**
   * 企業代表メールアドレス
   */
  private String email;

  /**
   * 担当者リスト
   */
  private List<PartnerContactDTO> contacts;

  /**
   * 作成日時
   */
  private LocalDateTime createdAt;

  /**
   * 更新日時
   */
  private LocalDateTime updatedAt;

  /**
   * PartnerエンティティからDTOに変換
   */
  public static PartnerResponse from(Partner partner) {
    if (partner == null)
      return null;

    return PartnerResponse.builder()
        .id(partner.getId())
        .name(partner.getName())
        .industry(partner.getIndustry())
        .phone(partner.getPhone())
        .postalCode(partner.getPostalCode())
        .address(partner.getAddress())
        .email(partner.getEmail())
        .contacts(partner.getContacts().stream()
            .map(PartnerContactDTO::from)
            .collect(Collectors.toList()))
        .createdAt(partner.getCreatedAt())
        .updatedAt(partner.getUpdatedAt())
        .build();
  }
}