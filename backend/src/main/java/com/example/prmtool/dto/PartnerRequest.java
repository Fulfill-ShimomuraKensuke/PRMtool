package com.example.prmtool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRequest {

    @NotBlank(message = "企業名は必須です")
    private String name;  // 企業名（必須）

    private String phone;  // 代表電話（任意）

    private String address;  // 住所（任意）

    // 追加: 担当者リスト（最低1人必須）
    @NotEmpty(message = "担当者は最低1人必要です")
    private List<PartnerContactDTO> contacts;
}