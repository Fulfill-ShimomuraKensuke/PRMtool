package com.example.prmtool.repository;

import com.example.prmtool.entity.ProjectTableData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectTableDataRepository extends JpaRepository<ProjectTableData, UUID> {
    
    // 案件IDでテーブルデータを検索
    Optional<ProjectTableData> findByProjectId(UUID projectId);
    
    // 案件IDでテーブルデータを削除
    void deleteByProjectId(UUID projectId);
}