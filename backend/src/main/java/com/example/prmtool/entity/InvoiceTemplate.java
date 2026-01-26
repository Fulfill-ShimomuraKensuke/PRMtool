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

/**
 * 請求書テンプレートエンティティ
 * ユーザーが作成した請求書のレイアウトとデザイン設定を保存
 */
@Entity
@Table(name = "invoice_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // テンプレート基本情報
    @Column(nullable = false, length = 100)
    private String templateName; // テンプレート識別用の名前
    
    @Column(columnDefinition = "TEXT")
    private String description; // テンプレートの用途や説明

    // ヘッダー設定 - 請求書上部に表示される会社情報
    @Column(length = 500)
    private String logoUrl; // 会社ロゴ画像のストレージURL
    
    @Column(length = 200)
    private String companyName; // 請求元の会社名
    
    @Column(length = 500)
    private String companyAddress; // 会社の住所
    
    @Column(length = 50)
    private String companyPhone; // 連絡先電話番号
    
    @Column(length = 100)
    private String companyEmail; // 連絡先メールアドレス
    
    @Column(length = 200)
    private String companyWebsite; // 会社のウェブサイトURL

    // レイアウト設定 - 請求書の構成要素の配置情報
    @Column(columnDefinition = "TEXT")
    private String layoutSettings; // JSON形式で項目の表示位置や順序を保存

    // デザイン設定 - 請求書の見た目を決定
    @Column(length = 20)
    private String primaryColor; // メインカラー（ヘッダー背景など）
    
    @Column(length = 20)
    private String secondaryColor; // サブカラー（罫線や強調表示）
    
    @Column(length = 50)
    private String fontFamily; // 使用するフォント名

    // 表示設定 - どの項目を表示するかの制御
    @Column(columnDefinition = "TEXT")
    private String displaySettings; // JSON形式で表示項目のON/OFFを保存

    // フッター設定 - 請求書下部に表示される情報
    @Column(columnDefinition = "TEXT")
    private String footerText; // 備考や追加メッセージ
    
    @Column(columnDefinition = "TEXT")
    private String bankInfo; // 振込先の銀行口座情報
    
    @Column(columnDefinition = "TEXT")
    private String paymentTerms; // 支払期日や支払条件

    // デフォルトテンプレート設定
    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false; // このテンプレートをデフォルトとして使用するか

    // メタデータ - テンプレートの作成者と作成・更新日時
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy; // テンプレートを作成したユーザー

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // テンプレート作成日時

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt; // テンプレート最終更新日時
}