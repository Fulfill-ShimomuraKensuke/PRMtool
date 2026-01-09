package com.example.prmtool.dto;

import com.example.prmtool.entity.Project;
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
public class ProjectResponse {

    private UUID id; // プロジェクトID
    private String name; // プロジェクト名
    private Project.ProjectStatus status; // プロジェクトステータス

    // パートナー情報
    private UUID partnerId; // 企業ID
    private String partnerName; // 企業名

    // オーナー（作成者）情報
    private UUID ownerId; // オーナーID
    private String ownerName; // オーナー名

    // 担当者リスト
    private List<ProjectAssignmentDTO> assignments; // 担当者リスト

    // テーブルデータ
    private ProjectTableDataDTO tableData; // プロジェクトのテーブルデータ

    private LocalDateTime createdAt; // 作成日時
    private LocalDateTime updatedAt; // 更新日時

    public static ProjectResponse from(Project project) {
        if (project == null)
            return null;

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .status(project.getStatus())
                .partnerId(project.getPartner().getId())
                .partnerName(project.getPartner().getName())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getName())
                .assignments(project.getAssignments().stream()
                        .map(ProjectAssignmentDTO::from)
                        .collect(Collectors.toList()))
                .tableData(ProjectTableDataDTO.from(project.getTableData()))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}