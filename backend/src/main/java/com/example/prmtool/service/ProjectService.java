package com.example.prmtool.service;

import com.example.prmtool.dto.ProjectRequest;
import com.example.prmtool.dto.ProjectResponse;
import com.example.prmtool.entity.*;
import com.example.prmtool.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

  private final ProjectRepository projectRepository; // ProjectRepository追加
  private final PartnerRepository partnerRepository; // PartnerRepository追加
  private final UserRepository userRepository; // UserRepository追加
  private final ProjectAssignmentRepository projectAssignmentRepository; // ProjectAssignmentRepository追加
  private final ProjectTableDataRepository projectTableDataRepository; // ProjectTableDataRepository追加

  public ProjectService(ProjectRepository projectRepository,
      PartnerRepository partnerRepository,
      UserRepository userRepository,
      ProjectAssignmentRepository projectAssignmentRepository,
      ProjectTableDataRepository projectTableDataRepository) {
    this.projectRepository = projectRepository;
    this.partnerRepository = partnerRepository;
    this.userRepository = userRepository;
    this.projectAssignmentRepository = projectAssignmentRepository;
    this.projectTableDataRepository = projectTableDataRepository;
  }

  // 案件作成
  @Transactional
  public ProjectResponse createProject(ProjectRequest request) {
    // パートナーを取得
    Partner partner = partnerRepository.findById(Objects.requireNonNull(request.getPartnerId()))
        .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + request.getPartnerId()));

    // オーナー（作成者）を取得
    User owner = userRepository.findById(Objects.requireNonNull(request.getOwnerId()))
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + request.getOwnerId()));

    // 案件を作成
    Project project = Project.builder()
        .name(request.getName())
        .status(request.getStatus())
        .partner(partner)
        .owner(owner)
        .build();

    // 保存（担当者とテーブルデータは後で追加）
    Project savedProject = projectRepository.save(project);

    // 担当者を追加
    if (request.getAssignedUserIds() != null && !request.getAssignedUserIds().isEmpty()) {
      for (UUID userId : request.getAssignedUserIds()) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + userId));

        ProjectAssignment assignment = ProjectAssignment.builder()
            .user(user)
            .build();
        savedProject.addAssignment(assignment);
      }
    }

    // テーブルデータを追加
    if (request.getTableDataJson() != null && !request.getTableDataJson().isBlank()) {
      ProjectTableData tableData = ProjectTableData.builder()
          .project(savedProject)
          .tableDataJson(request.getTableDataJson())
          .build();
      savedProject.setTableData(tableData);
    }

    // 再保存（担当者とテーブルデータを含む）
    Project finalProject = projectRepository.save(savedProject);
    return ProjectResponse.from(finalProject);
  }

  /**
   * 全案件を取得
   * 作成日時の昇順（登録順）で返却
   */
  @Transactional(readOnly = true)
  public List<ProjectResponse> getAllProjects() {
    return projectRepository.findAllByOrderByCreatedAtAsc().stream()
        .map(ProjectResponse::from)
        .collect(Collectors.toList());
  }

  /**
   * パートナーIDで案件を取得
   */
  @Transactional(readOnly = true)
  public List<ProjectResponse> getProjectsByOwner(UUID ownerId) {
    return projectRepository.findByOwnerId(Objects.requireNonNull(ownerId)).stream()
        .map(ProjectResponse::from)
        .collect(Collectors.toList());
  }

  // 担当者として見える案件を取得（NEW または 自分が担当）
  @Transactional(readOnly = true)
  public List<ProjectResponse> getVisibleProjectsForPartner(UUID userId) {
    // NEWステータスの案件
    List<Project> newProjects = projectRepository.findByStatus(Project.ProjectStatus.NEW);

    // 自分が担当者として割り当てられている案件
    List<ProjectAssignment> myAssignments = projectAssignmentRepository.findByUserId(userId);
    List<Project> assignedProjects = myAssignments.stream()
        .map(ProjectAssignment::getProject)
        .collect(Collectors.toList());

    // 重複を除いてマージ
    return newProjects.stream()
        .filter(p -> !assignedProjects.contains(p))
        .collect(Collectors.toList())
        .stream()
        .map(ProjectResponse::from)
        .collect(Collectors.toList());
  }

  // 案件詳細取得（アクセス制御付き）
  @Transactional(readOnly = true)
  public ProjectResponse getProjectByIdWithAccessControl(UUID id, String loginId) {
    User me = userRepository.findByLoginId(loginId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + loginId));

    Project project = projectRepository.findById(Objects.requireNonNull(id))
        .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + id));

    boolean isAdmin = me.getRole() == User.UserRole.ADMIN;
    if (!isAdmin) {
      // 担当者の場合、NEWまたは自分が担当している案件のみアクセス可能
      boolean canView = project.getStatus() == Project.ProjectStatus.NEW
          || project.getOwner().getId().equals(me.getId())
          || project.getAssignments().stream()
              .anyMatch(a -> a.getUser().getId().equals(me.getId()));

      if (!canView) {
        throw new AccessDeniedException("権限がありません");
      }
    }
    return ProjectResponse.from(project);
  }

  // 案件更新
  @Transactional
  public ProjectResponse updateProject(UUID id, ProjectRequest request, String loginId) {
    User editor = userRepository.findByLoginId(loginId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + loginId));

    Project project = projectRepository.findById(Objects.requireNonNull(id))
        .orElseThrow(() -> new RuntimeException("案件が見つかりません: " + id));

    // 基本情報を更新
    project.setName(request.getName());
    project.setStatus(request.getStatus());

    // パートナーを更新
    if (!project.getPartner().getId().equals(request.getPartnerId())) {
      Partner newPartner = partnerRepository.findById(request.getPartnerId())
          .orElseThrow(() -> new RuntimeException(
              "パートナーが見つかりません: " + request.getPartnerId()));
      project.setPartner(newPartner);
    }

    // 管理者の場合のみ担当者を更新可能
    if (editor.getRole() == User.UserRole.ADMIN && request.getAssignedUserIds() != null) {
      // 既存の担当者をクリア
      project.getAssignments().clear();
      // 新しい担当者を追加
      for (UUID userId : request.getAssignedUserIds()) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + userId));
        ProjectAssignment assignment = ProjectAssignment.builder()
            .user(user)
            .build();
        project.addAssignment(assignment);
      }
    }

    // テーブルデータを更新
    if (request.getTableDataJson() != null) {
      if (project.getTableData() != null) {
        // 既存データを更新
        project.getTableData().setTableDataJson(request.getTableDataJson());
      } else {
        // 新規データを作成
        ProjectTableData tableData = ProjectTableData.builder()
            .project(project)
            .tableDataJson(request.getTableDataJson())
            .build();
        project.setTableData(tableData);
      }
    }
    // 担当者は常に編集者にする（オーナーは変更しない）
    Project updatedProject = projectRepository.save(project);
    return ProjectResponse.from(updatedProject);
  }

  // 案件削除
  @Transactional
  public void deleteProject(UUID id) {
    if (!projectRepository.existsById(Objects.requireNonNull(id))) {
      throw new RuntimeException("案件が見つかりません: " + id);
    }
    projectRepository.deleteById(Objects.requireNonNull(id));
  }

  // プロジェクトのテーブルデータを取得
  @Transactional(readOnly = true)
  public String getProjectTableData(UUID projectId) {
    // プロジェクトの存在確認（存在しない場合は早期にエラーを返す）
    projectRepository.findById(projectId)
        .orElseThrow(() -> new RuntimeException("案件が見つかりません"));
    // テーブルデータを取得
    Optional<ProjectTableData> tableData = projectTableDataRepository.findByProjectId(projectId);
    // テーブルデータが存在しない場合はデフォルトのJSONを返す
    if (tableData.isEmpty() || tableData.get().getTableDataJson() == null) {
      return getDefaultTableDataJson();
    }
    return tableData.get().getTableDataJson();
  }

  // プロジェクトのテーブルデータを保存
  @Transactional
  public void saveProjectTableData(UUID projectId, String tableDataJson) {
    // プロジェクトの存在確認
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new RuntimeException("案件が見つかりません"));

    // 既存のテーブルデータを取得または新規作成
    ProjectTableData tableData = projectTableDataRepository.findByProjectId(projectId)
        .orElse(ProjectTableData.builder()
            .project(project)
            .build());

    // データを更新
    tableData.setTableDataJson(tableDataJson);

    // 保存
    projectTableDataRepository.save(tableData);
  }

  // デフォルトのテーブルデータJSON（5行×5列）
  private String getDefaultTableDataJson() {
    return """
        {
          "headers": ["列A", "列B", "列C", "列D", "列E"],
          "rows": [
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""]
          ]
        }
        """;
  }
}