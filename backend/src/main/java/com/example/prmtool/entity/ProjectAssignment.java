package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectAssignment {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id; // 一意識別子

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project; // プロジェクト

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user; // ユーザー

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime assignedAt; // 割り当て日時
}