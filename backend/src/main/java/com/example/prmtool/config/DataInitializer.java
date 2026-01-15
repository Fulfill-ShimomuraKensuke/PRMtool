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

  // 初期管理者の有効/無効フラグを設定ファイルから取得
  @Value("${app.initial-admin.enabled:true}")
  private boolean initialAdminEnabled;

  // 初期管理者の名前を設定ファイルから取得
  @Value("${app.initial-admin.name:System Admin}")
  private String initialAdminName;

  // 初期管理者のログインIDを設定ファイルから取得
  @Value("${app.initial-admin.loginId:system}")
  private String initialAdminLoginId;

  // 初期管理者のメールアドレスを設定ファイルから取得
  @Value("${app.initial-admin.email:system@example.com}")
  private String initialAdminEmail;

  // 初期管理者のパスワードを設定ファイルから取得
  @Value("${app.initial-admin.password:SystemPass123!}")
  private String initialAdminPassword;

  // アプリケーション起動時に初期データを投入するメソッド
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

      // SYSTEMロールで初期管理者を作成（アカウント管理のみ可能）
      User systemAdmin = User.builder()
          .name(initialAdminName)
          .loginId(initialAdminLoginId)
          .passwordHash(passwordEncoder.encode(initialAdminPassword))
          .email(initialAdminEmail)
          .role(User.UserRole.SYSTEM) // システム管理者として作成
          .createdBy("system-init")
          .isSystemProtected(true) // システム保護フラグを有効化
          .build();

      userRepository.save(systemAdmin);

      log.info("=================================================");
      log.info("初期システム管理者が作成されました");
      log.info("名前: {}", initialAdminName);
      log.info("ログインID: {}", initialAdminLoginId);
      log.info("メールアドレス: {}", initialAdminEmail);
      log.info("パスワード: {}", initialAdminPassword);
      log.info("ロール: SYSTEM（アカウント管理のみ可能）");
      log.info("=================================================");
      log.warn("セキュリティ警告: 本番環境では必ずパスワードを変更してください！");
    };
  }
}
