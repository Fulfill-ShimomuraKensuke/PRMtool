package com.example.prmtool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 許可するオリジン（開発環境 + 本番環境）
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:3000", // 開発環境
                "https://*.onrender.com" // Render本番環境（ワイルドカード対応）
        ));

        // 許可するHTTPメソッド
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 許可するヘッダー
        configuration.setAllowedHeaders(List.of("*"));

        // 認証情報（Cookie、Authorization header等）を含むリクエストを許可
        configuration.setAllowCredentials(true);

        // プリフライトリクエストのキャッシュ時間（秒）
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}