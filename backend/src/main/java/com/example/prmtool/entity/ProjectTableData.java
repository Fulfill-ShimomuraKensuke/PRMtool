package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_table_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTableData {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id; // テーブルデータの一意識別子

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false, unique = true)
  private Project project; // 関連するプロジェクト

  @Column(columnDefinition = "TEXT")
  private String tableDataJson; // JSON形式でテーブルデータを保存

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt; // 作成日時

  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt; // 更新日時
}