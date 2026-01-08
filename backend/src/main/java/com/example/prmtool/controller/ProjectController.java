package com.example.prmtool.controller;

import com.example.prmtool.dto.ProjectRequest;
import com.example.prmtool.dto.ProjectResponse;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import com.example.prmtool.service.ProjectService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    public ProjectController(ProjectService projectService, UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    /**
     * 案件作成
     */
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 案件一覧取得（ロール別の表示制御）
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            @RequestParam(required = false) UUID ownerId,
            Authentication authentication) {

        try {
            // ログインIDを使用してユーザーを検索
            String loginId = authentication.getName().trim();
            System.out.println("🔍 Auth loginId: [" + loginId + "]");

            User me = userRepository.findByLoginId(loginId)
                    .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + loginId));
            System.out.println("✅ User found: " + me.getId());

            boolean isAdmin = me.getRole() == User.UserRole.ADMIN;
            System.out.println("✅ isAdmin: " + isAdmin);

            List<ProjectResponse> projects;
            if (isAdmin) {
                System.out.println("📋 Fetching projects (admin mode)");
                // 管理者: 全件 or オーナー指定で絞り込み
                projects = (ownerId != null)
                        ? projectService.getProjectsByOwner(ownerId)
                        : projectService.getAllProjects();
            } else {
                System.out.println("📋 Fetching visible projects for partner");
                // 担当者: NEW または 自分が担当している案件のみ
                projects = projectService.getVisibleProjectsForPartner(me.getId());
            }

            System.out.println("✅ Projects count: " + projects.size());
            return ResponseEntity.ok(projects);

        } catch (Exception e) {
            System.err.println("❌ Error in getAllProjects: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 案件詳細取得（アクセス制御付き）
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id, 
            Authentication authentication) {
        String loginId = authentication.getName().trim();
        ProjectResponse response = projectService.getProjectByIdWithAccessControl(id, loginId);
        return ResponseEntity.ok(response);
    }

    /**
     * 案件更新
     * - 基本情報: 全員が更新可能
     * - 担当者: 管理者のみ更新可能（ProjectServiceで制御）
     * - テーブルデータ: 全員が更新可能
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication) {
        String loginId = authentication.getName().trim();
        ProjectResponse response = projectService.updateProject(id, request, loginId);
        return ResponseEntity.ok(response);
    }

    /**
     * 案件削除（管理者のみ）
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}