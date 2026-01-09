package com.example.prmtool.repository;

import com.example.prmtool.entity.ProjectTableData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectTableDataRepository extends JpaRepository<ProjectTableData, UUID> {

  // プロジェクトIDからテーブルデータを取得
  Optional<ProjectTableData> findByProjectId(UUID projectId);

  // プロジェクトIDでテーブルデータを削除
  void deleteByProjectId(UUID projectId);
}