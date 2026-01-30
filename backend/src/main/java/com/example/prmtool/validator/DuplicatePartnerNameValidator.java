package com.example.prmtool.validator;

import com.example.prmtool.entity.Partner;
import com.example.prmtool.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * 企業名重複チェックバリデータ
 * 同じ企業名が既に登録されていないかを検証
 */
@Component
@RequiredArgsConstructor
public class DuplicatePartnerNameValidator {

  private final PartnerRepository partnerRepository;

  /**
   * 企業名の重複をチェック（新規登録時）
   * 同じ企業名が存在する場合は例外をスロー
   */
  public void validate(String name) {
    validate(name, null);
  }

  /**
   * 企業名の重複をチェック（更新時）
   * 自分自身は除外して重複をチェック
   * 
   * @param name      企業名
   * @param excludeId 除外するパートナーID（更新時は自分自身のIDを指定）
   */
  public void validate(String name, UUID excludeId) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("企業名は必須です");
    }

    Optional<Partner> existing = partnerRepository.findByName(name);

    if (existing.isPresent()) {
      // 更新時は自分自身を除外
      if (excludeId == null || !existing.get().getId().equals(excludeId)) {
        throw new IllegalArgumentException(
            "企業名「" + name + "」は既に登録されています");
      }
    }
  }
}