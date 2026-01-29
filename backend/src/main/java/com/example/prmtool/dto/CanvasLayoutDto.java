package com.example.prmtool.dto;

import lombok.Data;
import java.util.List;

/**
 * キャンバスレイアウトDTO
 * テンプレートのcanvasLayoutフィールドをパースするためのクラス
 * 
 * 目的:
 * - JSON形式で保存されたレイアウト情報をJavaオブジェクトに変換
 * - PDF生成時に要素の配置情報を取得
 */
@Data
public class CanvasLayoutDto {

  private String version;
  private Canvas canvas;
  private List<Element> elements;

  /**
   * キャンバス設定
   */
  @Data
  public static class Canvas {
    private Integer width; // キャンバス幅（px）
    private Integer height; // キャンバス高さ（px）
    private String unit; // 単位（px）
    private String pageFormat; // ページフォーマット（A4）
  }

  /**
   * 要素
   * テキスト、画像、動的フィールドなどの配置情報
   */
  @Data
  public static class Element {
    private String id; // 要素の一意識別子
    private String type; // 要素タイプ（text, image, field）
    private String content; // テキスト要素の内容
    private String url; // 画像要素のURL
    private String fieldName; // 動的フィールド名
    private String label; // 動的フィールドのラベル
    private String prefix; // 動的フィールドの前置文字
    private String suffix; // 動的フィールドの後置文字
    private Position position; // 要素の位置
    private Size size; // 要素のサイズ
    private Style style; // 要素のスタイル
  }

  /**
   * 位置情報
   */
  @Data
  public static class Position {
    private Float x; // X座標（px）
    private Float y; // Y座標（px）
  }

  /**
   * サイズ情報
   */
  @Data
  public static class Size {
    private Float width; // 幅（px）
    private Float height; // 高さ（px）
  }

  /**
   * スタイル情報
   */
  @Data
  public static class Style {
    private Float fontSize; // フォントサイズ
    private String fontWeight; // フォント太さ（normal, bold）
    private String color; // 文字色（#RRGGBB）
    private String align; // テキスト配置（left, center, right）
  }
}