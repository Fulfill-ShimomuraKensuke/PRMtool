package com.example.prmtool.validator;

import com.example.prmtool.entity.PartnerContact;
import org.springframework.stereotype.Component;

/**
 * 担当者連絡先情報バリデータ
 * 電話番号またはメールアドレスのどちらかは必須
 */
@Component
public class ContactInfoValidator {

  /**
   * 担当者の連絡先情報を検証
   * 電話番号またはメールアドレスの少なくとも1つは必須
   * 
   * @param contact 検証対象の担当者情報
   */
  public void validate(PartnerContact contact) {
    if (!contact.hasValidContactInfo()) {
      throw new IllegalArgumentException(
          "担当者「" + contact.getContactName() + "」の電話番号またはメールアドレスのどちらかは必須です");
    }
  }

  /**
   * 電話番号とメールアドレスを個別に検証
   * エンティティ作成前の検証に使用
   * 
   * @param phone       電話番号
   * @param email       メールアドレス
   * @param contactName 担当者名（エラーメッセージ用）
   */
  public void validate(String phone, String email, String contactName) {
    boolean hasPhone = phone != null && !phone.isBlank();
    boolean hasEmail = email != null && !email.isBlank();

    if (!hasPhone && !hasEmail) {
      throw new IllegalArgumentException(
          "担当者「" + contactName + "」の電話番号またはメールアドレスのどちらかは必須です");
    }
  }
}