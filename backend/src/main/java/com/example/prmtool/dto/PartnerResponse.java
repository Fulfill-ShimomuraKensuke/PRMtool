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

    private UUID id;
    private String name;        // 企業名
    private String phone;       // 代表電話
    private String address;     // 住所
    private List<PartnerContactDTO> contacts;  // 担当者リスト
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PartnerResponse from(Partner partner) {
        if (partner == null) return null;

        return PartnerResponse.builder()
                .id(partner.getId())
                .name(partner.getName())
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