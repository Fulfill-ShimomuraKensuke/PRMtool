package com.example.prmtool.repository;

import com.example.prmtool.entity.InvoiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * InvoiceTemplateリポジトリ
 * 請求書テンプレートの永続化操作を提供
 */
@Repository
public interface InvoiceTemplateRepository extends JpaRepository<InvoiceTemplate, UUID> {

  /**
   * デフォルトテンプレートを検索
   * システム全体で1つのみデフォルトとして設定可能
   */
  Optional<InvoiceTemplate> findByIsDefaultTrue();

  /**
   * 作成者のユーザーIDでテンプレートを検索
   * ユーザーが作成した全テンプレートを取得
   */
  List<InvoiceTemplate> findByCreatedById(UUID createdById);

  /**
   * テンプレート名で検索
   * 重複チェックや特定テンプレートの検索に使用
   */
  Optional<InvoiceTemplate> findByTemplateName(String templateName);

  /**
   * 作成日時の降順でテンプレートを取得
   * 最新のテンプレートから順に表示
   */
  List<InvoiceTemplate> findAllByOrderByCreatedAtDesc();
}