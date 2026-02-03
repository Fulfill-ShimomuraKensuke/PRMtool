package com.example.prmtool.service.impl;

import com.example.prmtool.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * メール送信サービス実装
 * Spring Mail を使用してメール送信機能を提供
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender mailSender;

  @Value("${mail.from.email}")
  private String defaultFromEmail;

  @Value("${mail.from.name}")
  private String defaultFromName;

  /**
   * シンプルなテキストメールを送信
   */
  @Override
  public void sendSimpleMessage(String to, String subject, String text) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(defaultFromEmail);
      message.setTo(to);
      message.setSubject(subject);
      message.setText(text);

      mailSender.send(message);
      log.info("テキストメールを送信しました: to={}, subject={}", to, subject);

    } catch (Exception e) {
      log.error("メール送信に失敗しました: to={}, subject={}", to, subject, e);
      throw new RuntimeException("メール送信に失敗しました", e);
    }
  }

  /**
   * HTMLメールを送信
   */
  @Override
  public void sendHtmlMessage(String to, String subject, String htmlContent) {
    sendHtmlMessageWithCustomSender(defaultFromEmail, defaultFromName, to, subject, htmlContent);
  }

  /**
   * 添付ファイル付きメールを送信
   */
  @Override
  public void sendMessageWithAttachment(String to, String subject, String text,
      Resource attachment, String attachmentName) {
    sendMessageWithAttachmentAndCustomSender(
        defaultFromEmail, defaultFromName, to, subject, text, attachment, attachmentName);
  }

  /**
   * 送信元メールアドレスを指定してHTMLメールを送信
   */
  @Override
  public void sendHtmlMessageWithCustomSender(String from, String fromName, String to,
      String subject, String htmlContent) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      // 送信元設定（名前付き）
      helper.setFrom(from, fromName);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlContent, true); // trueでHTML形式

      mailSender.send(message);
      log.info("HTMLメールを送信しました: from={}, to={}, subject={}", from, to, subject);

    } catch (MessagingException e) {
      log.error("HTMLメール送信に失敗しました: from={}, to={}, subject={}", from, to, subject, e);
      throw new RuntimeException("HTMLメール送信に失敗しました", e);
    } catch (Exception e) {
      log.error("メール送信で予期しないエラーが発生しました", e);
      throw new RuntimeException("メール送信に失敗しました", e);
    }
  }

  /**
   * 送信元メールアドレスを指定して添付ファイル付きメールを送信
   */
  @Override
  public void sendMessageWithAttachmentAndCustomSender(String from, String fromName, String to,
      String subject, String htmlContent,
      Resource attachment, String attachmentName) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      // 送信元設定（名前付き）
      helper.setFrom(from, fromName);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlContent, true); // trueでHTML形式

      // 添付ファイル追加
      helper.addAttachment(attachmentName, attachment);

      mailSender.send(message);
      log.info("添付ファイル付きメールを送信しました: from={}, to={}, subject={}, attachment={}",
          from, to, subject, attachmentName);

    } catch (MessagingException e) {
      log.error("添付ファイル付きメール送信に失敗しました: from={}, to={}, subject={}",
          from, to, subject, e);
      throw new RuntimeException("添付ファイル付きメール送信に失敗しました", e);
    } catch (Exception e) {
      log.error("メール送信で予期しないエラーが発生しました", e);
      throw new RuntimeException("メール送信に失敗しました", e);
    }
  }
}