package com.example.prmtool.service;

import com.example.prmtool.entity.Partner;
import com.example.prmtool.entity.Project;
import com.example.prmtool.entity.User;
import com.example.prmtool.repository.PartnerRepository;
import com.example.prmtool.repository.ProjectRepository;
import com.example.prmtool.repository.UserRepository;
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
public class ProjectCsvService {

    private final ProjectRepository projectRepository;
    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;

    // ヘッダーマッピング定義
    private static final Map<String, String> HEADER_MAPPING = new HashMap<>();

    static {
        // 日本語ヘッダー
        HEADER_MAPPING.put("案件名", "name");
        HEADER_MAPPING.put("プロジェクト名", "name");
        HEADER_MAPPING.put("ステータス", "status");
        HEADER_MAPPING.put("状態", "status");
        HEADER_MAPPING.put("パートナー名", "partnerName");
        HEADER_MAPPING.put("取引先名", "partnerName");
        HEADER_MAPPING.put("オーナーログインID", "ownerLoginId");
        HEADER_MAPPING.put("担当者ログインID", "ownerLoginId");

        // 英語ヘッダー
        HEADER_MAPPING.put("name", "name");
        HEADER_MAPPING.put("project_name", "name");
        HEADER_MAPPING.put("status", "status");
        HEADER_MAPPING.put("partner_name", "partnerName");
        HEADER_MAPPING.put("owner_login_id", "ownerLoginId");
        HEADER_MAPPING.put("owner", "ownerLoginId");
    }

    public ProjectCsvService(ProjectRepository projectRepository,
            PartnerRepository partnerRepository,
            UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.partnerRepository = partnerRepository;
        this.userRepository = userRepository;
    }

    /**
     * CSVファイルから案件をインポート
     */
    @Transactional
    public Map<String, Object> importProjectsFromCsv(MultipartFile file, User currentUser) throws Exception {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        // パートナー名→Partnerマップを事前に構築
        Map<String, Partner> partnerMap = new HashMap<>();
        List<Partner> allPartners = partnerRepository.findAll();
        for (Partner partner : allPartners) {
            partnerMap.put(partner.getName().toLowerCase(), partner);
        }

        // ログインID→Userマップを事前に構築
        Map<String, User> userMap = new HashMap<>();
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            userMap.put(user.getLoginId().toLowerCase(), user);
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // Builder パターンを使用
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
                        ProjectImportData data = parseProjectFromRecord(record, normalizedHeaders);

                        // バリデーション: 案件名
                        if (data.name == null || data.name.trim().isEmpty()) {
                            errors.add("行" + rowNumber + ": 案件名は必須です");
                            errorCount++;
                            continue;
                        }

                        // バリデーション: パートナー名
                        if (data.partnerName == null || data.partnerName.trim().isEmpty()) {
                            errors.add("行" + rowNumber + ": パートナー名は必須です");
                            errorCount++;
                            continue;
                        }

                        // パートナーを検索
                        Partner partner = partnerMap.get(data.partnerName.toLowerCase());
                        if (partner == null) {
                            errors.add("行" + rowNumber + ": パートナー「" + data.partnerName + "」が見つかりません");
                            errorCount++;
                            continue;
                        }

                        // オーナーを決定
                        User owner = currentUser;
                        if (data.ownerLoginId != null && !data.ownerLoginId.trim().isEmpty()) {
                            User specifiedOwner = userMap.get(data.ownerLoginId.toLowerCase());
                            if (specifiedOwner != null) {
                                owner = specifiedOwner;
                            } else {
                                errors.add("行" + rowNumber + ": 警告: オーナー「" + data.ownerLoginId
                                        + "」が見つかりません。現在のユーザーをオーナーとして登録します");
                            }
                        }

                        // ステータスをバリデーション
                        Project.ProjectStatus status = parseStatus(data.status);

                        // Projectエンティティ作成
                        Project project = Project.builder()
                                .name(data.name.trim())
                                .status(status)
                                .partner(partner)
                                .owner(owner)
                                .build();

                        // 保存
                        projectRepository.save(project);
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
     * CSVレコードからProjectImportDataを生成
     */
    private ProjectImportData parseProjectFromRecord(CSVRecord record, Map<String, Integer> headers) {
        ProjectImportData data = new ProjectImportData();
        data.name = getValueByKey(record, headers, "name");
        data.status = getValueByKey(record, headers, "status");
        data.partnerName = getValueByKey(record, headers, "partnerName");
        data.ownerLoginId = getValueByKey(record, headers, "ownerLoginId");
        return data;
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

    /**
     * ステータス文字列をenumに変換
     */
    private Project.ProjectStatus parseStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return Project.ProjectStatus.NEW;
        }

        String statusUpper = status.trim().toUpperCase();

        // 日本語ステータス
        switch (statusUpper) {
            case "新規":
                return Project.ProjectStatus.NEW;
            case "進行中":
                return Project.ProjectStatus.IN_PROGRESS;
            case "完了":
                return Project.ProjectStatus.DONE;
        }

        // 英語ステータス
        try {
            return Project.ProjectStatus.valueOf(statusUpper);
        } catch (IllegalArgumentException e) {
            return Project.ProjectStatus.NEW;
        }
    }

    /**
     * CSVから読み取ったデータを保持する内部クラス
     */
    private static class ProjectImportData {
        String name;
        String status;
        String partnerName;
        String ownerLoginId;
    }
}