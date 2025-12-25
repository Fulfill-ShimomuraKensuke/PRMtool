package com.example.prmtool.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRequest {

    @NotBlank(message = "企業名は必須です")
    private String name;

    private String address;

    private String phone;
}