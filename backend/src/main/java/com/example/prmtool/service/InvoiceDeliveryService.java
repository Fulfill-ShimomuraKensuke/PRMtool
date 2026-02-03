package com.example.prmtool.service;

import com.example.prmtool.dto.InvoiceDeliveryRequest;
import com.example.prmtool.dto.InvoiceDeliveryResponse;
import com.example.prmtool.entity.*;
import com.example.prmtool.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 請求書送付サービス
 * 請求書のメール送信と送付履歴の管理を担当
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceDeliveryService {

  private final InvoiceDeliveryRepository deliveryRepository;
  private final InvoiceRepository invoiceRepository;
  private final InvoiceTemplateRepository templateRepository;
  private final SenderEmailAddressRepository senderEmailRepository;
  private final UserRepository userRepository;
  private final EmailService emailService;
  private final PdfGeneratorService pdfGeneratorService;

  /**
   * 請求書をメール送付
   * PDFを生成し、指定された宛先にメール送信
   */
  @Transactional
  public InvoiceDeliveryResponse sendInvoice(InvoiceDeliveryRequest request, UUID userId) {
    // 請求書を取得
    Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
        .orElseThrow(() -> new RuntimeException("請求書が見つかりません: " + request.getInvoiceId()));

    // 送信者を取得
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません: " + userId));

    // 送信元メールアドレスを取得
    SenderEmailAddress senderEmail;
    if (request.getSenderEmailId() != null) {
      senderEmail = senderEmailRepository.findById(request.getSenderEmailId())
          .orElseThrow(() -> new RuntimeException("送信元メールアドレスが見つかりません: " + request.getSenderEmailId()));
    } else {
      // デフォルトの送信元メールアドレスを使用
      senderEmail = senderEmailRepository.findByIsDefaultTrue()
          .orElseThrow(() -> new RuntimeException("デフォルトの送信元メールアドレスが設定されていません"));
    }

    // テンプレートを取得（請求書に設定されたテンプレートまたはデフォルト）
    InvoiceTemplate template = getTemplateForInvoice(invoice);

    // 件名と本文を生成
    String subject = generateSubject(request, invoice);
    String body = generateBody(request, invoice);

    // 送付履歴を作成（送信前）
    InvoiceDelivery delivery = InvoiceDelivery.builder()
        .invoice(invoice)
        .recipientEmail(request.getRecipientEmail())
        .senderEmail(senderEmail.getEmail())
        .subject(subject)
        .body(body)
        .template(template)
        .status(InvoiceDelivery.DeliveryStatus.PENDING)
        .sentBy(user)
        .sentAt(LocalDateTime.now())
        .build();

    try {
      // PDFを添付する場合
      if (request.getAttachPdf() != null && request.getAttachPdf()) {
        // PDFを生成（請求書とテンプレートを渡す）
        byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(invoice, template);
        ByteArrayResource pdfResource = new ByteArrayResource(pdfBytes);

        // 添付ファイル付きメールを送信
        emailService.sendMessageWithAttachmentAndCustomSender(
            senderEmail.getEmail(),
            senderEmail.getDisplayName(),
            request.getRecipientEmail(),
            subject,
            body,
            pdfResource,
            generatePdfFileName(invoice));
      } else {
        // HTMLメールのみ送信
        emailService.sendHtmlMessageWithCustomSender(
            senderEmail.getEmail(),
            senderEmail.getDisplayName(),
            request.getRecipientEmail(),
            subject,
            body);
      }

      // 送信成功
      delivery.setStatus(InvoiceDelivery.DeliveryStatus.SENT);
      log.info("請求書をメール送信しました: invoiceId={}, to={}", invoice.getId(), request.getRecipientEmail());

    } catch (Exception e) {
      // 送信失敗
      delivery.setStatus(InvoiceDelivery.DeliveryStatus.FAILED);
      delivery.setErrorMessage(e.getMessage());
      log.error("請求書のメール送信に失敗しました: invoiceId={}, to={}",
          invoice.getId(), request.getRecipientEmail(), e);
    }

    // 送付履歴を保存
    InvoiceDelivery saved = deliveryRepository.save(delivery);
    return convertToResponse(saved);
  }

  /**
   * 指定した請求書の送付履歴を取得
   */
  @Transactional(readOnly = true)
  public List<InvoiceDeliveryResponse> getDeliveriesByInvoice(UUID invoiceId) {
    return deliveryRepository.findByInvoiceIdOrderBySentAtDesc(invoiceId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 指定した送信者の送付履歴を取得
   */
  @Transactional(readOnly = true)
  public List<InvoiceDeliveryResponse> getDeliveriesBySender(UUID userId) {
    return deliveryRepository.findBySentByIdOrderBySentAtDesc(userId).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 指定したステータスの送付履歴を取得
   */
  @Transactional(readOnly = true)
  public List<InvoiceDeliveryResponse> getDeliveriesByStatus(InvoiceDelivery.DeliveryStatus status) {
    return deliveryRepository.findByStatusOrderBySentAtDesc(status).stream()
        .map(this::convertToResponse)
        .collect(Collectors.toList());
  }

  /**
   * 送付履歴をIDで取得
   */
  @Transactional(readOnly = true)
  public InvoiceDeliveryResponse getDeliveryById(UUID id) {
    InvoiceDelivery delivery = deliveryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("送付履歴が見つかりません: " + id));
    return convertToResponse(delivery);
  }

  /**
   * 請求書に使用するテンプレートを取得
   * 優先順位: 1. 請求書に保存されたtemplate → 2. デフォルトテンプレート
   */
  private InvoiceTemplate getTemplateForInvoice(Invoice invoice) {
    // 1. 請求書に保存されたtemplate
    if (invoice.getTemplate() != null) {
      return invoice.getTemplate();
    }

    // 2. デフォルトテンプレート
    return templateRepository.findByIsDefaultTrue()
        .orElseThrow(() -> new RuntimeException("デフォルトテンプレートが設定されていません"));
  }

  /**
   * メールの件名を生成
   * リクエストに件名が指定されていればそれを使用、なければデフォルトを生成
   */
  private String generateSubject(InvoiceDeliveryRequest request, Invoice invoice) {
    if (request.getSubject() != null && !request.getSubject().isEmpty()) {
      return request.getSubject();
    }

    // デフォルトの件名を生成
    return String.format("【請求書送付】%s（請求書番号: %s）",
        invoice.getPartner().getName(),
        invoice.getInvoiceNumber());
  }

  /**
   * メール本文を生成
   * リクエストに本文が指定されていればそれを使用、なければデフォルトを生成
   */
  private String generateBody(InvoiceDeliveryRequest request, Invoice invoice) {
    if (request.getBody() != null && !request.getBody().isEmpty()) {
      return request.getBody();
    }

    // デフォルトのHTML本文を生成
    return String.format(
        "<html>" +
            "<body style='font-family: sans-serif; line-height: 1.6;'>" +
            "<p>%s 御中</p>" +
            "<p>いつもお世話になっております。</p>" +
            "<p>下記の通り、請求書を送付いたします。</p>" +
            "<hr style='margin: 20px 0;'>" +
            "<table style='border-collapse: collapse; width: 100%%; max-width: 500px;'>" +
            "<tr><td style='padding: 8px; font-weight: bold; width: 150px;'>請求書番号:</td><td style='padding: 8px;'>%s</td></tr>"
            +
            "<tr><td style='padding: 8px; font-weight: bold;'>発行日:</td><td style='padding: 8px;'>%s</td></tr>" +
            "<tr><td style='padding: 8px; font-weight: bold;'>支払期限:</td><td style='padding: 8px;'>%s</td></tr>" +
            "<tr><td style='padding: 8px; font-weight: bold;'>合計金額:</td><td style='padding: 8px; font-size: 1.2em; color: #d32f2f;'>¥%,d</td></tr>"
            +
            "</table>" +
            "<hr style='margin: 20px 0;'>" +
            "<p>ご確認のほど、よろしくお願いいたします。</p>" +
            "<p style='margin-top: 30px; color: #666; font-size: 0.9em;'>本メールは自動送信されています。</p>" +
            "</body>" +
            "</html>",
        invoice.getPartner().getName(),
        invoice.getInvoiceNumber(),
        invoice.getIssueDate(),
        invoice.getDueDate(),
        invoice.getTotalAmount().intValue());
  }

  /**
   * PDFファイル名を生成
   */
  private String generatePdfFileName(Invoice invoice) {
    return String.format("請求書_%s_%s.pdf",
        invoice.getInvoiceNumber(),
        invoice.getIssueDate());
  }

  /**
   * エンティティをレスポンスDTOに変換
   */
  private InvoiceDeliveryResponse convertToResponse(InvoiceDelivery delivery) {
    return InvoiceDeliveryResponse.builder()
        .id(delivery.getId())
        .invoiceId(delivery.getInvoice().getId())
        .invoiceNumber(delivery.getInvoice().getInvoiceNumber())
        .recipientEmail(delivery.getRecipientEmail())
        .senderEmail(delivery.getSenderEmail())
        .subject(delivery.getSubject())
        .body(delivery.getBody())
        .status(delivery.getStatus())
        .errorMessage(delivery.getErrorMessage())
        .sentBy(delivery.getSentBy().getName())
        .sentAt(delivery.getSentAt())
        .createdAt(delivery.getCreatedAt())
        .build();
  }
}