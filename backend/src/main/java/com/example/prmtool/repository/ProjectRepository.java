package com.example.prmtool.repository;

import com.example.prmtool.entity.Project;
import com.example.prmtool.entity.Project.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

  // オーナーIDで案件を検索
  List<Project> findByOwnerId(UUID ownerId);

  // ステータスで案件を検索
  List<Project> findByStatus(ProjectStatus status);

  // パートナーIDで案件を検索
  List<Project> findByPartnerId(UUID partnerId);

  // ステータスまたはオーナーIDで重複なく案件を検索
  List<Project> findDistinctByStatusOrOwnerId(ProjectStatus status, UUID ownerId);
}