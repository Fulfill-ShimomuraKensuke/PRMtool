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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerResponse {

  private UUID id; // 企業ID
  private String name; // 企業名
  private String industry; // 業種
  private String phone; // 代表電話
  private String address; // 住所
  private List<PartnerContactDTO> contacts; // 担当者リスト
  private LocalDateTime createdAt; // 作成日時
  private LocalDateTime updatedAt; // 更新日時

  public static PartnerResponse from(Partner partner) {
    if (partner == null)
      return null;

    return PartnerResponse.builder()
        .id(partner.getId())
        .name(partner.getName())
        .industry(partner.getIndustry()) // 追加
        .phone(partner.getPhone())
        .address(partner.getAddress())
        .contacts(partner.getContacts().stream()
            .map(PartnerContactDTO::from)
            .collect(Collectors.toList()))
        .createdAt(partner.getCreatedAt())
        .updatedAt(partner.getUpdatedAt())
        .build();
  }
}