package com.example.prmtool.dto;

import com.example.prmtool.entity.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRequest {

  @NotBlank(message = "案件名は必須です")
  private String name;

  @NotNull(message = "ステータスは必須です")
  private Project.ProjectStatus status;

  @NotNull(message = "パートナーIDは必須です")
  private UUID partnerId;

  @NotNull(message = "オーナーIDは必須です")
  private UUID ownerId;

  // 担当者のIDリスト（任意）
  private List<UUID> assignedUserIds;

  // テーブルデータ（JSON文字列、任意）
  private String tableDataJson;
}