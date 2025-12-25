package com.example.prmtool.repository;

import com.example.prmtool.entity.Project;
import com.example.prmtool.entity.Project.ProjectStatus;
import com.example.prmtool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByOwner(User owner);
    List<Project> findByOwnerId(UUID ownerId);
    // 追加：担当者は NEW または自分担当だけ表示
    List<Project> findDistinctByStatusOrOwnerId(ProjectStatus status, UUID ownerId);

}