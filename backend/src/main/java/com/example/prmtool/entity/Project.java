package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private ProjectStatus status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partner_id", nullable = false)
  private Partner partner; // 関連するパートナー企業

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner; // メイン担当者（作成者）

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ProjectAssignment> assignments = new ArrayList<>();// 複数の担当者

  @OneToOne(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private ProjectTableData tableData;// テーブルデータ

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt; // 作成日時

  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt; // 更新日時

  // 担当者を追加するヘルパーメソッド
  public void addAssignment(ProjectAssignment assignment) {
    assignments.add(assignment);
    assignment.setProject(this);
  }

  // 担当者を削除するヘルパーメソッド
  public void removeAssignment(ProjectAssignment assignment) {
    assignments.remove(assignment);
    assignment.setProject(null);
  }

  public enum ProjectStatus {
    NEW, // 新規
    IN_PROGRESS, // 進行中
    DONE // 完了
  }
}