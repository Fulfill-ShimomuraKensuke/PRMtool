package com.example.prmtool.repository;

import com.example.prmtool.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

  // パートナーIDで案件を検索
  List<Project> findByPartnerId(UUID partnerId);

  // ステータスで案件を検索
  List<Project> findByStatus(Project.ProjectStatus status);

  // オーナーIDで案件を検索
  List<Project> findByOwnerId(UUID ownerId);

  // 案件に割り当てられているユーザーを検索
  @Query("SELECT p FROM Project p JOIN p.assignments a WHERE a.user.id = :userId")
  List<Project> findProjectsByAssignedUser(@Param("userId") UUID userId);

  // ステータス別の案件数を取得
  @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
  Long countByStatus(@Param("status") Project.ProjectStatus status);
}