package com.example.prmtool.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

/**
 * コンテンツフォルダエンティティ
 * ファイルを整理するためのフォルダ階層構造を管理
 */
@Entity
@Table(name = "content_folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentFolder {

  /**
   * フォルダの一意識別子
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  /**
   * フォルダ名（必須）
   */
  @Column(nullable = false, length = 100)
  @NotBlank(message = "フォルダ名は必須です")
  private String folderName;

  /**
   * フォルダの説明
   */
  @Column(columnDefinition = "TEXT")
  private String description;

  /**
   * 親フォルダ（階層構造のため）
   * nullの場合はルートフォルダ
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_folder_id")
  private ContentFolder parentFolder;

  /**
   * 子フォルダのリスト
   */
  @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ContentFolder> subFolders = new ArrayList<>();

  /**
   * フォルダ内のファイルリスト
   */
  @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ContentFile> files = new ArrayList<>();

  /**
   * 作成者
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  /**
   * 作成日時（自動設定）
   */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /**
   * 更新日時（自動設定）
   */
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /**
   * 子フォルダを追加するヘルパーメソッド
   * 双方向関連を正しく設定
   */
  public void addSubFolder(ContentFolder subFolder) {
    subFolders.add(subFolder);
    subFolder.setParentFolder(this);
  }

  /**
   * 子フォルダを削除するヘルパーメソッド
   * 双方向関連を正しく解除
   */
  public void removeSubFolder(ContentFolder subFolder) {
    subFolders.remove(subFolder);
    subFolder.setParentFolder(null);
  }

  /**
   * ファイルを追加するヘルパーメソッド
   * 双方向関連を正しく設定
   */
  public void addFile(ContentFile file) {
    files.add(file);
    file.setFolder(this);
  }

  /**
   * ファイルを削除するヘルパーメソッド
   * 双方向関連を正しく解除
   */
  public void removeFile(ContentFile file) {
    files.remove(file);
    file.setFolder(null);
  }
}