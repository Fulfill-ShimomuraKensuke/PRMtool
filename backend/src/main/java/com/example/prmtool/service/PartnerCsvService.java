package com.example.prmtool.service;

import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.PartnerContact;
import com.example.prmtool.repository.PartnerRepository;
import com.example.prmtool.validator.ContactInfoValidator;
import com.example.prmtool.validator.DuplicatePartnerNameValidator;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * パートナーCSVインポート/エクスポートサービス
 * 新スキーマ対応（郵便番号、メールアドレス、phone/email分離）
 */
@Service
public class PartnerCsvService {

  private final PartnerRepository partnerRepository;
  private final DuplicatePartnerNameValidator nameValidator;
  private final ContactInfoValidator contactValidator;

  /**
   * ヘッダーマッピング定義
   * CSV列名を内部フィールド名にマッピング
   */
  private static final Map<String, String> HEADER_MAPPING = new HashMap<>();

  static {
    // パートナー名
    HEADER_MAPPING.put("パートナー名", "name");
    HEADER_MAPPING.put("企業名", "name");
    HEADER_MAPPING.put("会社名", "name");

    // 業種
    HEADER_MAPPING.put("業種", "industry");
    HEADER_MAPPING.put("業界", "industry");

    // 代表電話
    HEADER_MAPPING.put("代表電話", "phone");
    HEADER_MAPPING.put("電話番号", "phone");
    HEADER_MAPPING.put("電話", "phone");

    // 郵便番号（新規追加）
    HEADER_MAPPING.put("郵便番号", "postalCode");

    // 住所
    HEADER_MAPPING.put("住所", "address");

    // メールアドレス（新規追加）
    HEADER_MAPPING.put("メールアドレス", "email");
    HEADER_MAPPING.put("メール", "email");

    // 担当者名（1セルに複数値）
    HEADER_MAPPING.put("担当者名", "contactNames");

    // 担当者連絡先（1セルに複数値）
    HEADER_MAPPING.put("担当者連絡先", "contactInfos");

    // 英語ヘッダー
    HEADER_MAPPING.put("name", "name");
    HEADER_MAPPING.put("company_name", "name");
    HEADER_MAPPING.put("industry", "industry");
    HEADER_MAPPING.put("phone", "phone");
    HEADER_MAPPING.put("postal_code", "postalCode");
    HEADER_MAPPING.put("address", "address");
    HEADER_MAPPING.put("email", "email");
    HEADER_MAPPING.put("contact_names", "contactNames");
    HEADER_MAPPING.put("contact_infos", "contactInfos");
  }

  public PartnerCsvService(
      PartnerRepository partnerRepository,
      DuplicatePartnerNameValidator nameValidator,
      ContactInfoValidator contactValidator) {
    this.partnerRepository = partnerRepository;
    this.nameValidator = nameValidator;
    this.contactValidator = contactValidator;
  }

  /**
   * CSVファイルからパートナーをインポート
   * 新スキーマ対応（郵便番号、メールアドレス、phone/email分離）
   */
  @Transactional
  public Map<String, Object> importPartnersFromCsv(MultipartFile file) throws Exception {
    List<String> errors = new ArrayList<>();
    int successCount = 0;
    int errorCount = 0;

    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

      // UTF-8 BOMをスキップ
      reader.mark(1);
      if (reader.read() != 0xFEFF) {
        reader.reset();
      }

      CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
          .setHeader()
          .setSkipHeaderRecord(true)
          .setIgnoreHeaderCase(true)
          .setTrim(true)
          .build();

      try (CSVParser csvParser = csvFormat.parse(reader)) {
        Map<String, Integer> headerMap = csvParser.getHeaderMap();
        Map<String, Integer> normalizedHeaders = normalizeHeaders(headerMap);

        int rowNumber = 1;
        for (CSVRecord record : csvParser) {
          rowNumber++;
          try {
            Partner partner = parsePartnerFromRecord(record, normalizedHeaders, rowNumber);

            // 企業名の必須チェック
            if (partner.getName() == null || partner.getName().trim().isEmpty()) {
              errors.add("行" + rowNumber + ": パートナー名は必須です");
              errorCount++;
              continue;
            }

            // 企業名の重複チェック
            try {
              nameValidator.validate(partner.getName());
            } catch (IllegalArgumentException e) {
              errors.add("行" + rowNumber + ": " + e.getMessage());
              errorCount++;
              continue;
            }

            // 担当者の必須チェック
            if (partner.getContacts() == null || partner.getContacts().isEmpty()) {
              errors.add("行" + rowNumber + ": 最低1人の担当者が必要です");
              errorCount++;
              continue;
            }

            // 担当者の連絡先バリデーション
            for (PartnerContact contact : partner.getContacts()) {
              try {
                contactValidator.validate(contact);
              } catch (IllegalArgumentException e) {
                errors.add("行" + rowNumber + ": " + e.getMessage());
                errorCount++;
                continue;
              }
            }

            // 保存
            partnerRepository.save(partner);
            successCount++;

          } catch (Exception e) {
            errors.add("行" + rowNumber + ": " + e.getMessage());
            errorCount++;
          }
        }
      }
    }

    Map<String, Object> result = new HashMap<>();
    result.put("successCount", successCount);
    result.put("errorCount", errorCount);
    result.put("errors", errors);
    return result;
  }

  /**
   * ヘッダーを正規化
   * CSV列名を内部フィールド名にマッピング
   */
  private Map<String, Integer> normalizeHeaders(Map<String, Integer> originalHeaders) {
    Map<String, Integer> normalized = new HashMap<>();

    for (Map.Entry<String, Integer> entry : originalHeaders.entrySet()) {
      String header = entry.getKey().trim();
      String normalizedKey = HEADER_MAPPING.getOrDefault(header, header);
      normalized.put(normalizedKey, entry.getValue());
    }

    return normalized;
  }

  /**
   * CSVレコードからPartnerエンティティを生成
   * 新スキーマ対応（郵便番号、メールアドレス追加）
   */
  private Partner parsePartnerFromRecord(CSVRecord record, Map<String, Integer> headers, int rowNumber)
      throws Exception {

    Partner partner = Partner.builder()
        .name(getValueByKey(record, headers, "name"))
        .industry(getValueByKey(record, headers, "industry"))
        .phone(getValueByKey(record, headers, "phone"))
        .postalCode(getValueByKey(record, headers, "postalCode"))
        .address(getValueByKey(record, headers, "address"))
        .email(getValueByKey(record, headers, "email"))
        .contacts(new ArrayList<>())
        .build();

    // 担当者をパース（1セルにカンマ区切りで複数値）
    List<PartnerContact> contacts = parseContacts(record, headers, rowNumber);
    for (PartnerContact contact : contacts) {
      partner.addContact(contact);
    }

    return partner;
  }

  /**
   * 担当者情報をパース（1セルにカンマ区切りで複数値）
   * 新スキーマ対応（phone/email分離）
   */
  private List<PartnerContact> parseContacts(CSVRecord record, Map<String, Integer> headers, int rowNumber)
      throws Exception {

    List<PartnerContact> contacts = new ArrayList<>();

    // 担当者名を取得（カンマ区切り）
    String contactNamesStr = getValueByKey(record, headers, "contactNames");
    // 担当者連絡先を取得（カンマ区切り）
    String contactInfosStr = getValueByKey(record, headers, "contactInfos");

    // 両方が空の場合はエラー
    if ((contactNamesStr == null || contactNamesStr.trim().isEmpty()) &&
        (contactInfosStr == null || contactInfosStr.trim().isEmpty())) {
      throw new Exception("担当者名と担当者連絡先は必須です");
    }

    // カンマで分割
    String[] names = contactNamesStr != null ? contactNamesStr.split(",") : new String[0];
    String[] infos = contactInfosStr != null ? contactInfosStr.split(",") : new String[0];

    // 数が一致するかチェック
    if (names.length != infos.length) {
      throw new Exception("担当者名と担当者連絡先の数が一致しません（名前:" + names.length + "件、連絡先:" + infos.length + "件）");
    }

    // 各担当者を生成
    for (int i = 0; i < names.length; i++) {
      String name = names[i].trim();
      String info = infos[i].trim();

      if (name.isEmpty() || info.isEmpty()) {
        throw new Exception("担当者名と担当者連絡先は空にできません");
      }

      // 連絡先がメールアドレス形式か電話番号形式かを判定
      PartnerContact.PartnerContactBuilder builder = PartnerContact.builder()
          .contactName(name);

      if (info.contains("@")) {
        // @が含まれていればメールアドレス
        builder.email(info);
      } else {
        // それ以外は電話番号
        builder.phone(info);
      }

      PartnerContact contact = builder.build();

      // バリデーション: 電話番号またはメールアドレスのどちらかは必須
      if (!contact.hasValidContactInfo()) {
        throw new Exception("担当者「" + name + "」の連絡先は電話番号またはメールアドレスが必須です");
      }

      contacts.add(contact);
    }

    return contacts;
  }

  /**
   * ヘッダーマップからキーで値を取得
   */
  private String getValueByKey(CSVRecord record, Map<String, Integer> headers, String key) {
    Integer index = headers.get(key);
    if (index != null && index < record.size()) {
      String value = record.get(index);
      return (value != null && !value.trim().isEmpty()) ? value.trim() : null;
    }
    return null;
  }
}