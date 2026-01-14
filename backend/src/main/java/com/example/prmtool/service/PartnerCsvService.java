package com.example.prmtool.service;

import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.PartnerContact;
import com.example.prmtool.repository.PartnerRepository;
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

@Service
public class PartnerCsvService {

  private final PartnerRepository partnerRepository;

  // ヘッダーマッピング定義
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

    // 住所
    HEADER_MAPPING.put("住所", "address");

    // 担当者名（1セルに複数値）
    HEADER_MAPPING.put("担当者名", "contactNames");

    // 担当者連絡先（1セルに複数値）
    HEADER_MAPPING.put("担当者連絡先", "contactInfos");

    // 英語ヘッダー
    HEADER_MAPPING.put("name", "name");
    HEADER_MAPPING.put("company_name", "name");
    HEADER_MAPPING.put("industry", "industry");
    HEADER_MAPPING.put("phone", "phone");
    HEADER_MAPPING.put("address", "address");
    HEADER_MAPPING.put("contact_names", "contactNames");
    HEADER_MAPPING.put("contact_infos", "contactInfos");
  }

  public PartnerCsvService(PartnerRepository partnerRepository) {
    this.partnerRepository = partnerRepository;
  }

  // CSVファイルからパートナーをインポート
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

            // バリデーション
            if (partner.getName() == null || partner.getName().trim().isEmpty()) {
              errors.add("行" + rowNumber + ": パートナー名は必須です");
              errorCount++;
              continue;
            }

            if (partner.getContacts() == null || partner.getContacts().isEmpty()) {
              errors.add("行" + rowNumber + ": 最低1人の担当者が必要です");
              errorCount++;
              continue;
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

  // ヘッダーを正規化
  private Map<String, Integer> normalizeHeaders(Map<String, Integer> originalHeaders) {
    Map<String, Integer> normalized = new HashMap<>();

    for (Map.Entry<String, Integer> entry : originalHeaders.entrySet()) {
      String header = entry.getKey().trim();
      String normalizedKey = HEADER_MAPPING.getOrDefault(header, header);
      normalized.put(normalizedKey, entry.getValue());
    }

    return normalized;
  }

  // CSVレコードからPartnerエンティティを生成
  private Partner parsePartnerFromRecord(CSVRecord record, Map<String, Integer> headers, int rowNumber)
      throws Exception {

    Partner partner = Partner.builder()
        .name(getValueByKey(record, headers, "name"))
        .industry(getValueByKey(record, headers, "industry"))
        .phone(getValueByKey(record, headers, "phone"))
        .address(getValueByKey(record, headers, "address"))
        .contacts(new ArrayList<>())
        .build();

    // 担当者をパース（1セルにカンマ区切りで複数値）
    List<PartnerContact> contacts = parseContacts(record, headers, rowNumber);
    for (PartnerContact contact : contacts) {
      partner.addContact(contact);
    }

    return partner;
  }

  // 担当者情報をパース（1セルにカンマ区切りで複数値）
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

      PartnerContact contact = PartnerContact.builder()
          .contactName(name)
          .contactInfo(info)
          .build();
      contacts.add(contact);
    }

    return contacts;
  }

  // ヘッダーマップからキーで値を取得
  private String getValueByKey(CSVRecord record, Map<String, Integer> headers, String key) {
    Integer index = headers.get(key);
    if (index != null && index < record.size()) {
      return record.get(index);
    }
    return null;
  }
}