package com.example.prmtool.config;

import com.example.prmtool.entity.User;
import com.example.prmtool.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.initial-admin.enabled:true}")
    private boolean initialAdminEnabled;

    @Value("${app.initial-admin.name:Admin}")
    private String initialAdminName;

    @Value("${app.initial-admin.loginId:admin}")
    private String initialAdminLoginId;

    @Value("${app.initial-admin.email:admin@example.com}")
    private String initialAdminEmail;

    @Value("${app.initial-admin.password:StrongPassword123!}")
    private String initialAdminPassword;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 初期管理者作成が無効化されている場合はスキップ
            if (!initialAdminEnabled) {
                log.info("初期管理者の自動作成は無効化されています");
                return;
            }

            // 既にユーザーが存在する場合はスキップ
            if (userRepository.count() > 0) {
                log.info("ユーザーが既に存在します。初期管理者の作成をスキップします。");
                return;
            }

            // 初期管理者を作成
            User admin = User.builder()
                    .name(initialAdminName)
                    .loginId(initialAdminLoginId)
                    .passwordHash(passwordEncoder.encode(initialAdminPassword))
                    .email(initialAdminEmail)
                    .role(User.UserRole.ADMIN)
                    .createdBy("system-init")
                    .isSystemProtected(true)
                    .build();

            userRepository.save(admin);

            log.info("=================================================");
            log.info("初期管理者が作成されました");
            log.info("名前: {}", initialAdminName);
            log.info("ログインID: {}", initialAdminLoginId);
            log.info("メールアドレス: {}", initialAdminEmail);
            log.info("パスワード: {}", initialAdminPassword);
            log.info("=================================================");
            log.warn("セキュリティ警告: 本番環境では必ずパスワードを変更してください！");
        };
    }
}