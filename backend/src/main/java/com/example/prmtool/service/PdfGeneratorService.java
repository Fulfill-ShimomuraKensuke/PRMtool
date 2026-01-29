package com.example.prmtool.service;

import com.example.prmtool.dto.CanvasLayoutDto;
import com.example.prmtool.entity.Invoice;
import com.example.prmtool.entity.InvoiceTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * PDF生成サービス
 * canvasLayoutに基づいてPDFを生成
 * 
 * 処理フロー:
 * 1. canvasLayoutをJSONからパース
 * 2. 各要素を座標指定で描画
 * 3. 動的フィールドに実データを埋め込み
 * 4. PDFバイト配列を返却
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PdfGeneratorService {

  private final ObjectMapper objectMapper;

  /**
   * 請求書PDFを生成（canvasLayout使用）
   * 
   * パラメータ:
   * - invoice: 請求書データ
   * - template: テンプレート（canvasLayoutを含む）
   * 
   * 戻り値:
   * - PDFファイルのバイト配列
   */
  public byte[] generateInvoicePdf(Invoice invoice, InvoiceTemplate template) {
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      PdfWriter writer = new PdfWriter(baos);
      PdfDocument pdfDoc = new PdfDocument(writer);

      // A4サイズ: 595x842ポイント (1ポイント = 1/72インチ)
      Document document = new Document(pdfDoc);

      // 日本語フォントを読み込み
      PdfFont font = PdfFontFactory.createFont("HeiseiMin-W3", "UniJIS-UCS2-H");

      // canvasLayoutをパース
      if (template.getCanvasLayout() != null && !template.getCanvasLayout().isEmpty()) {
        CanvasLayoutDto layout = objectMapper.readValue(
            template.getCanvasLayout(),
            CanvasLayoutDto.class);

        // 動的フィールドの値マップを構築
        Map<String, String> fieldValues = buildFieldValuesMap(invoice);

        // 各要素を描画
        for (CanvasLayoutDto.Element element : layout.getElements()) {
          drawElement(document, element, fieldValues, font);
        }
      } else {
        // canvasLayoutがない場合はエラーメッセージを表示
        Paragraph errorMsg = new Paragraph("このテンプレートはcanvasLayoutを持っていません。")
            .setFont(font)
            .setFontSize(16)
            .setTextAlignment(TextAlignment.CENTER);
        document.add(errorMsg);
      }

      document.close();
      return baos.toByteArray();

    } catch (Exception e) {
      log.error("PDF生成エラー", e);
      throw new RuntimeException("PDF生成に失敗しました: " + e.getMessage(), e);
    }
  }

  /**
   * プレビュー用PDFを生成（サンプルデータ使用）
   * 
   * パラメータ:
   * - template: テンプレート
   * 
   * 戻り値:
   * - PDFファイルのバイト配列
   */
  public byte[] generatePreviewPdf(InvoiceTemplate template) {
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      PdfWriter writer = new PdfWriter(baos);
      PdfDocument pdfDoc = new PdfDocument(writer);
      Document document = new Document(pdfDoc);

      // 日本語フォントを読み込み
      PdfFont font = PdfFontFactory.createFont("HeiseiMin-W3", "UniJIS-UCS2-H");

      // canvasLayoutをパース
      if (template.getCanvasLayout() != null && !template.getCanvasLayout().isEmpty()) {
        CanvasLayoutDto layout = objectMapper.readValue(
            template.getCanvasLayout(),
            CanvasLayoutDto.class);

        // サンプルデータを生成
        Map<String, String> fieldValues = buildSampleFieldValues();

        // 各要素を描画
        for (CanvasLayoutDto.Element element : layout.getElements()) {
          drawElement(document, element, fieldValues, font);
        }
      } else {
        // canvasLayoutがない場合はエラーメッセージを表示
        Paragraph errorMsg = new Paragraph("このテンプレートはcanvasLayoutを持っていません。")
            .setFont(font)
            .setFontSize(16)
            .setTextAlignment(TextAlignment.CENTER);
        document.add(errorMsg);
      }

      document.close();
      return baos.toByteArray();

    } catch (Exception e) {
      log.error("プレビューPDF生成エラー", e);
      throw new RuntimeException("プレビューPDF生成に失敗しました: " + e.getMessage(), e);
    }
  }

  /**
   * 要素を描画
   * 要素タイプに応じて適切な描画処理を実行
   */
  private void drawElement(
      Document document,
      CanvasLayoutDto.Element element,
      Map<String, String> fieldValues,
      PdfFont font) throws Exception {

    switch (element.getType()) {
      case "text":
        // 静的テキストを描画
        drawText(document, element, element.getContent(), font);
        break;

      case "field":
        // 動的フィールドを描画（実データに置き換え）
        String fieldValue = fieldValues.getOrDefault(element.getFieldName(), "");
        String displayValue = buildDisplayValue(element, fieldValue);
        drawText(document, element, displayValue, font);
        break;

      case "image":
        // 画像を描画
        drawImage(document, element);
        break;

      default:
        log.warn("未対応の要素タイプ: {}", element.getType());
    }
  }

  /**
   * テキストを描画
   * 座標とスタイルに基づいて配置
   */
  private void drawText(
      Document document,
      CanvasLayoutDto.Element element,
      String text,
      PdfFont font) {
    // ピクセルをポイントに変換
    // A4サイズ: キャンバス794px = PDF 595pt, キャンバス1123px = PDF 842pt
    float x = element.getPosition().getX() * 595f / 794f;
    float y = 842f - (element.getPosition().getY() * 842f / 1123f); // Y座標は上下反転

    CanvasLayoutDto.Style style = element.getStyle();

    // スタイル設定
    Paragraph paragraph = new Paragraph(text)
        .setFont(font)
        .setFontSize(style.getFontSize() != null ? style.getFontSize() : 12f)
        .setFontColor(parseColor(style.getColor()))
        .setFixedPosition(x, y, element.getSize().getWidth() * 595f / 794f);

    // テキスト配置
    if ("center".equals(style.getAlign())) {
      paragraph.setTextAlignment(TextAlignment.CENTER);
    } else if ("right".equals(style.getAlign())) {
      paragraph.setTextAlignment(TextAlignment.RIGHT);
    } else {
      paragraph.setTextAlignment(TextAlignment.LEFT);
    }

    // 太字設定
    if ("bold".equals(style.getFontWeight())) {
      paragraph.setBold();
    }

    document.add(paragraph);
  }

  /**
   * 画像を描画
   */
  private void drawImage(Document document, CanvasLayoutDto.Element element) throws Exception {
    try {
      // 画像URLから画像データを取得
      // Data URLの場合とHTTP URLの場合を処理
      String imageUrl = element.getUrl();

      if (imageUrl.startsWith("data:image")) {
        // Data URLの場合（base64エンコード）
        String base64Data = imageUrl.split(",")[1];
        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
        Image image = new Image(ImageDataFactory.create(imageBytes));

        // 座標変換
        float x = element.getPosition().getX() * 595f / 794f;
        float y = 842f - ((element.getPosition().getY() + element.getSize().getHeight()) * 842f / 1123f);

        // サイズ設定
        image.setFixedPosition(x, y);
        image.scaleToFit(
            element.getSize().getWidth() * 595f / 794f,
            element.getSize().getHeight() * 842f / 1123f);

        document.add(image);
      } else {
        // HTTP URLの場合
        Image image = new Image(ImageDataFactory.create(new URL(imageUrl)));

        // 座標変換
        float x = element.getPosition().getX() * 595f / 794f;
        float y = 842f - ((element.getPosition().getY() + element.getSize().getHeight()) * 842f / 1123f);

        // サイズ設定
        image.setFixedPosition(x, y);
        image.scaleToFit(
            element.getSize().getWidth() * 595f / 794f,
            element.getSize().getHeight() * 842f / 1123f);

        document.add(image);
      }
    } catch (Exception e) {
      log.error("画像の描画に失敗しました: {}", element.getUrl(), e);
      // 画像描画失敗時はスキップ（エラーで全体を止めない）
    }
  }

  /**
   * 動的フィールドの値マップを構築
   * 請求書データから各フィールドの値を抽出
   */
  private Map<String, String> buildFieldValuesMap(Invoice invoice) {
    Map<String, String> values = new HashMap<>();

    values.put("companyName", invoice.getPartner().getName());
    values.put("industry", invoice.getPartner().getIndustry() != null ? invoice.getPartner().getIndustry() : "");
    values.put("address", invoice.getPartner().getAddress() != null ? invoice.getPartner().getAddress() : "");
    values.put("phone", invoice.getPartner().getPhone() != null ? invoice.getPartner().getPhone() : "");
    values.put("representativeName", invoice.getPartner().getName()); // パートナー名を代表者名として使用

    // 日付フォーマット
    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
    values.put("issueDate", invoice.getIssueDate().format(dateFormatter));
    values.put("dueDate", invoice.getDueDate().format(dateFormatter));

    // 金額フォーマット（カンマ区切り）
    values.put("totalAmount", String.format("%,d", invoice.getTotalAmount().longValue()));

    return values;
  }

  /**
   * サンプルフィールド値を構築
   * プレビュー表示用のダミーデータ
   */
  private Map<String, String> buildSampleFieldValues() {
    Map<String, String> values = new HashMap<>();

    values.put("companyName", "株式会社サンプル");
    values.put("industry", "情報通信業");
    values.put("address", "東京都渋谷区〇〇1-2-3");
    values.put("phone", "03-1234-5678");
    values.put("representativeName", "山田太郎");
    values.put("issueDate", "2026年01月29日");
    values.put("dueDate", "2026年02月28日");
    values.put("totalAmount", "1,234,567");

    return values;
  }

  /**
   * 表示値を構築
   * prefix + 値 + suffix の形式で組み立て
   */
  private String buildDisplayValue(CanvasLayoutDto.Element element, String value) {
    StringBuilder sb = new StringBuilder();

    if (element.getPrefix() != null && !element.getPrefix().isEmpty()) {
      sb.append(element.getPrefix());
    }

    sb.append(value);

    if (element.getSuffix() != null && !element.getSuffix().isEmpty()) {
      sb.append(element.getSuffix());
    }

    return sb.toString();
  }

  /**
   * カラーコードをiText Colorに変換
   */
  private Color parseColor(String colorCode) {
    if (colorCode == null || colorCode.isEmpty()) {
      return new DeviceRgb(0, 0, 0); // デフォルトは黒
    }

    // #RRGGBBの形式をパース
    colorCode = colorCode.replace("#", "");

    try {
      int r = Integer.parseInt(colorCode.substring(0, 2), 16);
      int g = Integer.parseInt(colorCode.substring(2, 4), 16);
      int b = Integer.parseInt(colorCode.substring(4, 6), 16);
      return new DeviceRgb(r, g, b);
    } catch (Exception e) {
      log.warn("カラーコードのパースに失敗: {}", colorCode);
      return new DeviceRgb(0, 0, 0);
    }
  }
}