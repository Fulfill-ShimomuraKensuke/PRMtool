package com.example.prmtool.repository;

import com.example.prmtool.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, UUID> {

    // 案件IDで担当者を検索
    List<ProjectAssignment> findByProjectId(UUID projectId);

    // 案件IDで担当者を削除
    void deleteByProjectId(UUID projectId);

    // ユーザーIDで担当している案件を検索
    List<ProjectAssignment> findByUserId(UUID userId);
}