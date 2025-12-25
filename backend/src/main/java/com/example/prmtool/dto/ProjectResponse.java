package com.example.prmtool.dto;

import com.example.prmtool.entity.Project;
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
public class ProjectResponse {

    private UUID id;
    private String name;
    private Project.ProjectStatus status;
    private UUID partnerId;
    private String partnerName;
    private UUID ownerId;
    private String ownerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .status(project.getStatus())
                .partnerId(project.getPartner().getId())
                .partnerName(project.getPartner().getName())
                .ownerId(project.getOwner().getId())
                .ownerEmail(project.getOwner().getEmail())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}