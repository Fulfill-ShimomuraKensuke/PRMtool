package com.example.prmtool.repository;

import com.example.prmtool.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * パートナーリポジトリ
 * パートナー企業情報のデータアクセス層
 */
@Repository
public interface PartnerRepository extends JpaRepository<Partner, UUID> {

  /**
   * 企業名で検索
   * 企業名の重複チェックに使用
   * 
   * @param name 企業名
   * @return 該当するパートナー（存在しない場合はEmpty）
   */
  Optional<Partner> findByName(String name);
}