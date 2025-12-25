package com.example.prmtool.dto;

import com.example.prmtool.entity.Partner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerResponse {

    private UUID id;
    private String name;
    private String address;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PartnerResponse from(Partner partner) {
        return PartnerResponse.builder()
                .id(partner.getId())
                .name(partner.getName())
                .address(partner.getAddress())
                .phone(partner.getPhone())
                .createdAt(partner.getCreatedAt())
                .updatedAt(partner.getUpdatedAt())
                .build();
    }
}