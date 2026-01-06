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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;
    private final UserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter,
            UserDetailsService userDetailsService,
            CorsConfigurationSource corsConfigurationSource) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.userDetailsService = userDetailsService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http,
            PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);
        return authManagerBuilder.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS設定
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // ===== 認証不要 =====
                        .requestMatchers(
                                "/",
                                "/api/health",
                                "/error",
                                "/favicon.ico",
                                "/api/auth/login",
                                "/api/admin/bootstrap")
                        .permitAll()

                        // CORS Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // CORS Preflight（OPTIONS）は全て許可
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // パートナー管理
                        // GET（一覧・詳細）は認証済みなら誰でもOK
                        .requestMatchers(HttpMethod.GET, "/api/partners", "/api/partners/*").authenticated()
                        // POST/PUT/DELETE（作成・更新・削除）は管理者のみ
                        .requestMatchers(HttpMethod.POST, "/api/partners").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/partners/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/partners/*").hasRole("ADMIN")

                        // 案件管理
                        // GET/POST/PUT（一覧・作成・更新）は認証済みなら誰でもOK
                        .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/projects").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/projects/*").authenticated()
                        // DELETE（削除）は管理者のみ
                        .requestMatchers(HttpMethod.DELETE, "/api/projects/*").hasRole("ADMIN")

                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}