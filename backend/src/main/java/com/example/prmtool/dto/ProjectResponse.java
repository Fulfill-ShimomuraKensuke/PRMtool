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

    private UUID id;
    private String name;
    private Project.ProjectStatus status;

    // パートナー情報
    private UUID partnerId;
    private String partnerName;

    // オーナー（作成者）情報
    private UUID ownerId;
    private String ownerName;

    // 🆕 追加: 担当者リスト
    private List<ProjectAssignmentDTO> assignments;

    // 🆕 追加: テーブルデータ
    private ProjectTableDataDTO tableData;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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