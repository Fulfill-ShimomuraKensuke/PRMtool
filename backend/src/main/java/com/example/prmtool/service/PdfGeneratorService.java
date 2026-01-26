package com.example.prmtool.service;

import com.example.prmtool.entity.Invoice;
import com.example.prmtool.entity.InvoiceTemplate;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * PDF生成サービス
 * 請求書テンプレートに基づいてPDFファイルを生成
 */
@Service
@Slf4j
public class PdfGeneratorService {

  /**
   * 請求書PDFを生成
   * テンプレートのレイアウトとデザイン設定を適用してPDFを作成
   */
  public byte[] generateInvoicePdf(Invoice invoice, InvoiceTemplate template) {
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
      PdfWriter writer = new PdfWriter(baos);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc);

      // カラー設定を取得
      Color primaryColor = parseColor(template.getPrimaryColor());
      Color secondaryColor = parseColor(template.getSecondaryColor());

      // ヘッダー部分を追加
      addHeader(document, template, primaryColor);

      // 請求書情報を追加
      addInvoiceInfo(document, invoice, secondaryColor);

      // 明細テーブルを追加
      addItemsTable(document, invoice, primaryColor, secondaryColor);

      // 合計金額を追加
      addTotalSection(document, invoice, primaryColor);

      // フッター情報を追加
      addFooter(document, template, secondaryColor);

      document.close();
      return baos.toByteArray();

    } catch (Exception e) {
      log.error("PDF生成中にエラーが発生しました", e);
      throw new RuntimeException("PDF生成に失敗しました: " + e.getMessage(), e);
    }
  }

  /**
   * プレビュー用のサンプルPDFを生成
   * テンプレートのデザインを確認するためのダミーデータを使用
   */
  public byte[] generatePreviewPdf(InvoiceTemplate template) {
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
      PdfWriter writer = new PdfWriter(baos);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc);

      Color primaryColor = parseColor(template.getPrimaryColor());
      Color secondaryColor = parseColor(template.getSecondaryColor());

      // ヘッダー
      addHeader(document, template, primaryColor);

      // サンプル請求書情報
      addPreviewInvoiceInfo(document, secondaryColor);

      // サンプル明細テーブル
      addPreviewItemsTable(document, primaryColor, secondaryColor);

      // サンプル合計金額
      addPreviewTotalSection(document, primaryColor);

      // フッター
      addFooter(document, template, secondaryColor);

      document.close();
      return baos.toByteArray();

    } catch (Exception e) {
      log.error("プレビューPDF生成中にエラーが発生しました", e);
      throw new RuntimeException("プレビューPDF生成に失敗しました: " + e.getMessage(), e);
    }
  }

  /**
   * ヘッダー部分を追加
   * 会社ロゴ、会社名、連絡先情報を表示
   */
  private void addHeader(Document document, InvoiceTemplate template, Color primaryColor) {
    // タイトル
    Paragraph title = new Paragraph("請求書")
        .setFontSize(24)
        .setBold()
        .setFontColor(primaryColor)
        .setTextAlignment(TextAlignment.CENTER)
        .setMarginBottom(20);
    document.add(title);

    // 会社情報
    if (template.getCompanyName() != null) {
      Paragraph companyName = new Paragraph(template.getCompanyName())
          .setFontSize(14)
          .setBold()
          .setMarginBottom(5);
      document.add(companyName);
    }

    if (template.getCompanyAddress() != null) {
      document.add(new Paragraph(template.getCompanyAddress()).setFontSize(10));
    }

    if (template.getCompanyPhone() != null) {
      document.add(new Paragraph("TEL: " + template.getCompanyPhone()).setFontSize(10));
    }

    if (template.getCompanyEmail() != null) {
      document.add(new Paragraph("Email: " + template.getCompanyEmail()).setFontSize(10));
    }

    document.add(new Paragraph("\n"));
  }

  /**
   * 請求書情報セクションを追加
   * 請求先、請求番号、発行日、支払期限を表示
   */
  private void addInvoiceInfo(Document document, Invoice invoice, Color secondaryColor) {
    Table infoTable = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }));
    infoTable.setWidth(UnitValue.createPercentValue(100));

    // 請求先情報
    Cell billToCell = new Cell()
        .add(new Paragraph("請求先:").setBold())
        .add(new Paragraph(invoice.getPartner().getName()))
        .setBorder(null)
        .setPadding(5);
    infoTable.addCell(billToCell);

    // 請求書詳細
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
    Cell detailsCell = new Cell()
        .add(new Paragraph("請求書番号: " + invoice.getInvoiceNumber()))
        .add(new Paragraph("発行日: " + invoice.getIssueDate().format(formatter)))
        .add(new Paragraph("支払期限: " + invoice.getDueDate().format(formatter)))
        .setBorder(null)
        .setPadding(5)
        .setTextAlignment(TextAlignment.RIGHT);
    infoTable.addCell(detailsCell);

    document.add(infoTable);
    document.add(new Paragraph("\n"));
  }

  /**
   * 明細テーブルを追加
   * 品目、数量、単価、金額を表形式で表示
   */
  private void addItemsTable(Document document, Invoice invoice, Color primaryColor, Color secondaryColor) {
    Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 1, 2, 2 }));
    table.setWidth(UnitValue.createPercentValue(100));

    // ヘッダー行
    String[] headers = { "品目", "数量", "単価", "金額" };
    for (String header : headers) {
      Cell cell = new Cell()
          .add(new Paragraph(header).setBold())
          .setBackgroundColor(primaryColor)
          .setFontColor(new DeviceRgb(255, 255, 255))
          .setTextAlignment(TextAlignment.CENTER)
          .setPadding(8);
      table.addHeaderCell(cell);
    }

    // 明細行
    invoice.getItems().forEach(item -> {
      table.addCell(createCell(item.getDescription()));
      table.addCell(createCell(String.valueOf(item.getQuantity()), TextAlignment.CENTER));
      table.addCell(createCell(String.format("¥%,.0f", item.getUnitPrice()), TextAlignment.RIGHT));
      table.addCell(createCell(String.format("¥%,.0f", item.getItemTotal()), TextAlignment.RIGHT));
    });

    document.add(table);
    document.add(new Paragraph("\n"));
  }

  /**
   * 合計金額セクションを追加
   * 小計、消費税、合計金額を表示
   */
  private void addTotalSection(Document document, Invoice invoice, Color primaryColor) {
    Table totalTable = new Table(UnitValue.createPercentArray(new float[] { 3, 1 }));
    totalTable.setWidth(UnitValue.createPercentValue(50));
    totalTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

    // 小計
    totalTable.addCell(createCell("小計:").setBold().setTextAlignment(TextAlignment.RIGHT));
    totalTable
        .addCell(createCell(String.format("¥%,.0f", invoice.getSubtotal())).setTextAlignment(TextAlignment.RIGHT));

    // 消費税
    totalTable.addCell(createCell("消費税:").setBold().setTextAlignment(TextAlignment.RIGHT));
    totalTable
        .addCell(createCell(String.format("¥%,.0f", invoice.getTaxAmount())).setTextAlignment(TextAlignment.RIGHT));

    // 合計
    Cell totalLabelCell = createCell("合計金額:")
        .setBold()
        .setBackgroundColor(primaryColor)
        .setFontColor(new DeviceRgb(255, 255, 255))
        .setTextAlignment(TextAlignment.RIGHT);
    totalTable.addCell(totalLabelCell);

    Cell totalValueCell = createCell(String.format("¥%,.0f", invoice.getTotalAmount()))
        .setBold()
        .setBackgroundColor(primaryColor)
        .setFontColor(new DeviceRgb(255, 255, 255))
        .setTextAlignment(TextAlignment.RIGHT);
    totalTable.addCell(totalValueCell);

    document.add(totalTable);
    document.add(new Paragraph("\n"));
  }

  /**
   * フッター情報を追加
   * 振込先情報、支払条件、備考を表示
   */
  private void addFooter(Document document, InvoiceTemplate template, Color secondaryColor) {
    if (template.getBankInfo() != null && !template.getBankInfo().isEmpty()) {
      Paragraph bankTitle = new Paragraph("振込先情報")
          .setBold()
          .setFontColor(secondaryColor)
          .setMarginTop(10);
      document.add(bankTitle);
      document.add(new Paragraph(template.getBankInfo()).setFontSize(10));
    }

    if (template.getPaymentTerms() != null && !template.getPaymentTerms().isEmpty()) {
      Paragraph termsTitle = new Paragraph("支払条件")
          .setBold()
          .setFontColor(secondaryColor)
          .setMarginTop(10);
      document.add(termsTitle);
      document.add(new Paragraph(template.getPaymentTerms()).setFontSize(10));
    }

    if (template.getFooterText() != null && !template.getFooterText().isEmpty()) {
      Paragraph footer = new Paragraph(template.getFooterText())
          .setFontSize(9)
          .setFontColor(secondaryColor)
          .setMarginTop(20)
          .setTextAlignment(TextAlignment.CENTER);
      document.add(footer);
    }
  }

  /**
   * プレビュー用の請求書情報を追加
   * サンプルデータを使用してレイアウトを確認
   */
  private void addPreviewInvoiceInfo(Document document, Color secondaryColor) {
    Table infoTable = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }));
    infoTable.setWidth(UnitValue.createPercentValue(100));

    Cell billToCell = new Cell()
        .add(new Paragraph("請求先:").setBold())
        .add(new Paragraph("サンプル株式会社"))
        .setBorder(null)
        .setPadding(5);
    infoTable.addCell(billToCell);

    Cell detailsCell = new Cell()
        .add(new Paragraph("請求書番号: INV-2026-001"))
        .add(new Paragraph("発行日: 2026年01月26日"))
        .add(new Paragraph("支払期限: 2026年02月25日"))
        .setBorder(null)
        .setPadding(5)
        .setTextAlignment(TextAlignment.RIGHT);
    infoTable.addCell(detailsCell);

    document.add(infoTable);
    document.add(new Paragraph("\n"));
  }

  /**
   * プレビュー用の明細テーブルを追加
   * サンプルデータを使用
   */
  private void addPreviewItemsTable(Document document, Color primaryColor, Color secondaryColor) {
    Table table = new Table(UnitValue.createPercentArray(new float[] { 3, 1, 2, 2 }));
    table.setWidth(UnitValue.createPercentValue(100));

    // ヘッダー
    String[] headers = { "品目", "数量", "単価", "金額" };
    for (String header : headers) {
      Cell cell = new Cell()
          .add(new Paragraph(header).setBold())
          .setBackgroundColor(primaryColor)
          .setFontColor(new DeviceRgb(255, 255, 255))
          .setTextAlignment(TextAlignment.CENTER)
          .setPadding(8);
      table.addHeaderCell(cell);
    }

    // サンプル明細
    table.addCell(createCell("コンサルティング業務"));
    table.addCell(createCell("1", TextAlignment.CENTER));
    table.addCell(createCell("¥500,000", TextAlignment.RIGHT));
    table.addCell(createCell("¥500,000", TextAlignment.RIGHT));

    table.addCell(createCell("システム開発支援"));
    table.addCell(createCell("2", TextAlignment.CENTER));
    table.addCell(createCell("¥300,000", TextAlignment.RIGHT));
    table.addCell(createCell("¥600,000", TextAlignment.RIGHT));

    document.add(table);
    document.add(new Paragraph("\n"));
  }

  /**
   * プレビュー用の合計金額セクションを追加
   * サンプルデータを使用
   */
  private void addPreviewTotalSection(Document document, Color primaryColor) {
    Table totalTable = new Table(UnitValue.createPercentArray(new float[] { 3, 1 }));
    totalTable.setWidth(UnitValue.createPercentValue(50));
    totalTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

    totalTable.addCell(createCell("小計:").setBold().setTextAlignment(TextAlignment.RIGHT));
    totalTable.addCell(createCell("¥1,100,000").setTextAlignment(TextAlignment.RIGHT));

    totalTable.addCell(createCell("消費税:").setBold().setTextAlignment(TextAlignment.RIGHT));
    totalTable.addCell(createCell("¥110,000").setTextAlignment(TextAlignment.RIGHT));

    Cell totalLabelCell = createCell("合計金額:")
        .setBold()
        .setBackgroundColor(primaryColor)
        .setFontColor(new DeviceRgb(255, 255, 255))
        .setTextAlignment(TextAlignment.RIGHT);
    totalTable.addCell(totalLabelCell);

    Cell totalValueCell = createCell("¥1,210,000")
        .setBold()
        .setBackgroundColor(primaryColor)
        .setFontColor(new DeviceRgb(255, 255, 255))
        .setTextAlignment(TextAlignment.RIGHT);
    totalTable.addCell(totalValueCell);

    document.add(totalTable);
  }

  /**
   * テーブルセルを生成
   * 標準的なパディングとボーダーを適用
   */
  private Cell createCell(String content) {
    return new Cell()
        .add(new Paragraph(content))
        .setPadding(5);
  }

  /**
   * テーブルセルを生成（配置指定）
   * 標準的なパディングとボーダー、指定された配置を適用
   */
  private Cell createCell(String content, TextAlignment alignment) {
    return new Cell()
        .add(new Paragraph(content))
        .setPadding(5)
        .setTextAlignment(alignment);
  }

  /**
   * カラーコードを解析
   * 16進数カラーコードをiTextのColorオブジェクトに変換
   */
  private Color parseColor(String colorCode) {
    if (colorCode == null || !colorCode.startsWith("#")) {
      return new DeviceRgb(0, 0, 0); // デフォルトは黒
    }

    try {
      String hex = colorCode.substring(1);
      int r = Integer.parseInt(hex.substring(0, 2), 16);
      int g = Integer.parseInt(hex.substring(2, 4), 16);
      int b = Integer.parseInt(hex.substring(4, 6), 16);
      return new DeviceRgb(r, g, b);
    } catch (Exception e) {
      log.warn("無効なカラーコード: {}, デフォルトの黒を使用します", colorCode);
      return new DeviceRgb(0, 0, 0);
    }
  }
}