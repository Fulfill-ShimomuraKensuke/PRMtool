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
        // 日本語ヘッダー
        HEADER_MAPPING.put("企業名", "name");
        HEADER_MAPPING.put("会社名", "name");
        HEADER_MAPPING.put("代表電話", "phone");
        HEADER_MAPPING.put("電話番号", "phone");
        HEADER_MAPPING.put("電話", "phone");
        HEADER_MAPPING.put("住所", "address");

        // 英語ヘッダー
        HEADER_MAPPING.put("name", "name");
        HEADER_MAPPING.put("company_name", "name");
        HEADER_MAPPING.put("phone", "phone");
        HEADER_MAPPING.put("address", "address");
    }

    public PartnerCsvService(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    /**
     * CSVファイルからパートナーをインポート
     */
    @Transactional
    public Map<String, Object> importPartnersFromCsv(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // 🔧 修正: Builder パターンを使用
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
                        Partner partner = parsePartnerFromRecord(record, normalizedHeaders);

                        // バリデーション
                        if (partner.getName() == null || partner.getName().trim().isEmpty()) {
                            errors.add("行" + rowNumber + ": 企業名は必須です");
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

    /**
     * ヘッダーを正規化
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
     */
    private Partner parsePartnerFromRecord(CSVRecord record, Map<String, Integer> headers) {
        Partner partner = Partner.builder()
                .name(getValueByKey(record, headers, "name"))
                .phone(getValueByKey(record, headers, "phone"))
                .address(getValueByKey(record, headers, "address"))
                .contacts(new ArrayList<>())
                .build();

        // 担当者を動的に検出（contact1_name, contact1_info, contact2_name, ...）
        List<PartnerContact> contacts = parseContacts(record, headers);
        for (PartnerContact contact : contacts) {
            partner.addContact(contact);
        }

        return partner;
    }

    /**
     * 担当者情報を動的にパース
     */
    private List<PartnerContact> parseContacts(CSVRecord record, Map<String, Integer> headers) {
        List<PartnerContact> contacts = new ArrayList<>();

        // contact1_name, contact1_info, contact2_name, contact2_info のパターンを検出
        for (int i = 1; i <= 10; i++) { // 最大10人の担当者をサポート
            String contactNameKey = "contact" + i + "_name";
            String contactInfoKey = "contact" + i + "_info";

            // 日本語パターンも対応
            String jpContactNameKey = "担当者名" + i;
            String jpContactInfoKey = "担当者連絡先" + i;

            String contactName = getValueByKey(record, headers, contactNameKey);
            String contactInfo = getValueByKey(record, headers, contactInfoKey);

            // 日本語ヘッダーもチェック
            if (contactName == null || contactName.isEmpty()) {
                contactName = getValueByKey(record, headers, jpContactNameKey);
            }
            if (contactInfo == null || contactInfo.isEmpty()) {
                contactInfo = getValueByKey(record, headers, jpContactInfoKey);
            }

            if (contactName != null && !contactName.trim().isEmpty()
                    && contactInfo != null && !contactInfo.trim().isEmpty()) {
                PartnerContact contact = PartnerContact.builder()
                        .contactName(contactName.trim())
                        .contactInfo(contactInfo.trim())
                        .build();
                contacts.add(contact);
            }
        }

        return contacts;
    }

    /**
     * ヘッダーマップからキーで値を取得
     */
    private String getValueByKey(CSVRecord record, Map<String, Integer> headers, String key) {
        Integer index = headers.get(key);
        if (index != null && index < record.size()) {
            return record.get(index);
        }
        return null;
    }
}