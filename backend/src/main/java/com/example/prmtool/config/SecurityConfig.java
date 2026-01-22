package com.example.prmtool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security設定
 * 役割ベースのアクセス制御を実装
 * ADMIN: 全権限
 * ACCOUNTING: 手数料ルール・請求書の作成・編集・確定（削除不可）
 * REP: 限定的なアクセス
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  private final JwtRequestFilter jwtRequestFilter;
  private final UserDetailsService userDetailsService;
  private final CorsConfigurationSource corsConfigurationSource;

  // 必要なサービスをDIコンテナから注入
  public SecurityConfig(JwtRequestFilter jwtRequestFilter,
      UserDetailsService userDetailsService,
      CorsConfigurationSource corsConfigurationSource) {
    this.jwtRequestFilter = jwtRequestFilter;
    this.userDetailsService = userDetailsService;
    this.corsConfigurationSource = corsConfigurationSource;
  }

  // パスワードのハッシュ化に使用するエンコーダーを定義
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  // 認証マネージャーの設定
  @Bean
  public AuthenticationManager authenticationManager(HttpSecurity http,
      PasswordEncoder passwordEncoder) throws Exception {
    AuthenticationManagerBuilder authManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
    authManagerBuilder
        .userDetailsService(userDetailsService)
        .passwordEncoder(passwordEncoder);
    return authManagerBuilder.build();
  }

  // セキュリティフィルターチェーンの設定（アクセス制御のルール定義）
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // 認証不要のエンドポイント
            .requestMatchers(
                "/",
                "/api/health",
                "/error",
                "/favicon.ico",
                "/api/auth/login",
                "/api/admin/bootstrap")
            .permitAll()

            // CORS Preflight リクエストを許可
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // ユーザー管理（ADMIN, SYSTEM, REP がアクセス可能）
            .requestMatchers("/api/users", "/api/users/**").hasAnyRole("SYSTEM", "ADMIN", "REP")

            // パートナー管理（ADMIN と REP がアクセス可能、作成・編集・削除は ADMIN のみ）
            .requestMatchers(HttpMethod.GET, "/api/partners", "/api/partners/*").hasAnyRole("ADMIN", "REP")
            .requestMatchers(HttpMethod.POST, "/api/partners").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/partners/*").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/partners/*").hasRole("ADMIN")

            // 案件管理（ADMIN と REP がアクセス可能、削除は ADMIN のみ）
            .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/**").hasAnyRole("ADMIN", "REP")
            .requestMatchers(HttpMethod.POST, "/api/projects").hasAnyRole("ADMIN", "REP")
            .requestMatchers(HttpMethod.PUT, "/api/projects/*").hasAnyRole("ADMIN", "REP")
            .requestMatchers(HttpMethod.DELETE, "/api/projects/*").hasRole("ADMIN")

            // ========================================
            // 手数料ルール管理
            // - 閲覧: ADMIN, ACCOUNTING, REP
            // - 作成・編集・確定: ADMIN, ACCOUNTING
            // - 削除: ADMIN のみ
            // ========================================
            .requestMatchers(HttpMethod.GET, "/api/commission-rules", "/api/commission-rules/**")
            .hasAnyRole("ADMIN", "ACCOUNTING", "REP")
            .requestMatchers(HttpMethod.POST, "/api/commission-rules")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.PUT, "/api/commission-rules/*")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.PATCH, "/api/commission-rules/*/status")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.DELETE, "/api/commission-rules/*")
            .hasRole("ADMIN")

            // ========================================
            // 請求書管理
            // - 閲覧: ADMIN, ACCOUNTING, REP
            // - 作成・編集: ADMIN, ACCOUNTING
            // - ステータス変更: ADMIN, ACCOUNTING
            // - 支払済に変更: ADMIN, ACCOUNTING（専用エンドポイント）
            // - 削除: ADMIN のみ
            // ========================================
            .requestMatchers(HttpMethod.GET, "/api/invoices", "/api/invoices/**")
            .hasAnyRole("ADMIN", "ACCOUNTING", "REP")
            .requestMatchers(HttpMethod.POST, "/api/invoices")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.PUT, "/api/invoices/*")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.PATCH, "/api/invoices/*/status")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.PATCH, "/api/invoices/*/mark-as-paid")
            .hasAnyRole("ADMIN", "ACCOUNTING")
            .requestMatchers(HttpMethod.DELETE, "/api/invoices/*")
            .hasRole("ADMIN")

            // ========================================
            // パートナー別ダッシュボード
            // - GETのみ
            // ========================================
            .requestMatchers(HttpMethod.GET, "/api/partners/*/dashboard")
            .hasAnyRole("ADMIN", "REP")

            // その他全てのリクエストは認証が必要
            .anyRequest().authenticated())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}