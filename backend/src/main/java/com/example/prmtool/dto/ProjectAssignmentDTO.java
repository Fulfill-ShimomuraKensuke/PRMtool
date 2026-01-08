package com.example.prmtool.dto;

import com.example.prmtool.entity.ProjectAssignment;
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
public class ProjectAssignmentDTO {

    private UUID userId; // ユーザーID
    private String userName; // ユーザー名
    private String userLoginId; // ログインID
    private LocalDateTime assignedAt; // 割り当て日時

    public static ProjectAssignmentDTO from(ProjectAssignment assignment) {
        if (assignment == null)
            return null;

        return ProjectAssignmentDTO.builder()
                .userId(assignment.getUser().getId())
                .userName(assignment.getUser().getName())
                .userLoginId(assignment.getUser().getLoginId())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}