package com.example.prmtool.service;

import org.springframework.core.io.Resource;

/**
 * メール送信サービスインターフェース
 * テキストメール、HTMLメール、添付ファイル付きメールの送信を提供
 */
public interface EmailService {

  /**
   * シンプルなテキストメールを送信
   * 
   * @param to      宛先メールアドレス
   * @param subject 件名
   * @param text    本文
   */
  void sendSimpleMessage(String to, String subject, String text);

  /**
   * HTMLメールを送信
   * 
   * @param to          宛先メールアドレス
   * @param subject     件名
   * @param htmlContent HTML本文
   */
  void sendHtmlMessage(String to, String subject, String htmlContent);

  /**
   * 添付ファイル付きメールを送信
   * 
   * @param to             宛先メールアドレス
   * @param subject        件名
   * @param text           本文
   * @param attachment     添付ファイル
   * @param attachmentName 添付ファイル名
   */
  void sendMessageWithAttachment(String to, String subject, String text,
      Resource attachment, String attachmentName);

  /**
   * 送信元メールアドレスを指定してHTMLメールを送信
   * 
   * @param from        送信元メールアドレス
   * @param fromName    送信元名
   * @param to          宛先メールアドレス
   * @param subject     件名
   * @param htmlContent HTML本文
   */
  void sendHtmlMessageWithCustomSender(String from, String fromName, String to,
      String subject, String htmlContent);

  /**
   * 送信元メールアドレスを指定して添付ファイル付きメールを送信
   * 
   * @param from           送信元メールアドレス
   * @param fromName       送信元名
   * @param to             宛先メールアドレス
   * @param subject        件名
   * @param htmlContent    HTML本文
   * @param attachment     添付ファイル
   * @param attachmentName 添付ファイル名
   */
  void sendMessageWithAttachmentAndCustomSender(String from, String fromName, String to,
      String subject, String htmlContent,
      Resource attachment, String attachmentName);
}