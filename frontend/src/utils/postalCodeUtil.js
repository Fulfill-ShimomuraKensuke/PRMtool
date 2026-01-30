/**
 * 郵便番号検索ユーティリティ
 * zipcloud APIを使用して郵便番号から住所を取得
 */

/**
 * 郵便番号から住所を検索
 * 
 * @param {string} postalCode - 郵便番号（7桁の数字）
 * @returns {Promise<Object|null>} 住所情報または null
 */
export const searchAddressByPostalCode = async (postalCode) => {
  // 郵便番号の形式チェック（7桁の数字のみ）
  const cleanedPostalCode = postalCode.replace(/[^0-9]/g, '');

  if (cleanedPostalCode.length !== 7) {
    return null;
  }

  try {
    // zipcloud API を使用
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedPostalCode}`
    );

    if (!response.ok) {
      console.error('郵便番号API エラー:', response.status);
      return null;
    }

    const data = await response.json();

    // API レスポンスの確認
    if (!data.results || data.results.length === 0) {
      console.warn('該当する住所が見つかりません');
      return null;
    }

    // 最初の結果を返す
    const result = data.results[0];
    return {
      prefecture: result.address1,      // 都道府県
      city: result.address2,            // 市区町村
      town: result.address3,            // 町域
      fullAddress: `${result.address1}${result.address2}${result.address3}`,
      prefectureKana: result.kana1,     // 都道府県カナ
      cityKana: result.kana2,           // 市区町村カナ
      townKana: result.kana3            // 町域カナ
    };
  } catch (error) {
    console.error('郵便番号検索エラー:', error);
    return null;
  }
};

/**
 * 郵便番号のフォーマット
 * 7桁の数字を「XXX-XXXX」形式に変換（表示用）
 * 
 * @param {string} postalCode - 郵便番号
 * @returns {string} フォーマットされた郵便番号
 */
export const formatPostalCode = (postalCode) => {
  const cleaned = postalCode.replace(/[^0-9]/g, '');

  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return cleaned;
};

/**
 * 郵便番号の検証
 * 
 * @param {string} postalCode - 郵便番号
 * @returns {boolean} 有効な郵便番号かどうか
 */
export const validatePostalCode = (postalCode) => {
  const cleaned = postalCode.replace(/[^0-9]/g, '');
  return /^\d{7}$/.test(cleaned);
};