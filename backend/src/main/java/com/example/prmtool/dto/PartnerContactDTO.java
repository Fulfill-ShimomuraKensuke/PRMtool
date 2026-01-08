package com.example.prmtool.dto;

import com.example.prmtool.entity.PartnerContact;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerContactDTO {

    private UUID id;
    private String contactName;   // 担当者名
    private String contactInfo;   // 担当者連絡先

    public static PartnerContactDTO from(PartnerContact contact) {
        if (contact == null) return null;
        
        return PartnerContactDTO.builder()
                .id(contact.getId())
                .contactName(contact.getContactName())
                .contactInfo(contact.getContactInfo())
                .build();
    }
}