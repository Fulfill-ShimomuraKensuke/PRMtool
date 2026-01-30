/**
 * パートナー情報バリデーションユーティリティ
 * フォーム入力のバリデーションロジック
 */

/**
 * 電話番号のバリデーション
 * 形式: 数字とハイフンのみ（例: 03-1234-5678、090-1234-5678）
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return true; // 空欄は許可（任意項目）
  }

  const phoneRegex = /^\d{2,4}-\d{2,4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return true; // 空欄は許可（任意項目）
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 郵便番号のバリデーション
 * 形式: 7桁の数字のみ（ハイフンなし）
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode || postalCode.trim() === '') {
    return true; // 空欄は許可（任意項目）
  }

  const cleaned = postalCode.replace(/[^0-9]/g, '');
  return /^\d{7}$/.test(cleaned);
};

/**
 * 担当者の連絡先情報バリデーション
 * 電話番号またはメールアドレスのどちらかは必須
 */
export const validateContactInfo = (contact) => {
  const hasPhone = contact.phone && contact.phone.trim() !== '';
  const hasEmail = contact.email && contact.email.trim() !== '';

  return hasPhone || hasEmail;
};

/**
 * パートナーフォーム全体のバリデーション
 */
export const validatePartnerForm = (formData) => {
  const errors = {};

  // 企業名の必須チェック
  if (!formData.name || formData.name.trim() === '') {
    errors.name = '企業名は必須です';
  }

  // 代表電話のフォーマットチェック
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = '電話番号は「03-1234-5678」形式で入力してください';
  }

  // 郵便番号のフォーマットチェック
  if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
    errors.postalCode = '郵便番号は7桁の数字で入力してください';
  }

  // メールアドレスのフォーマットチェック
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = '正しいメールアドレス形式で入力してください';
  }

  // 担当者のバリデーション
  if (formData.contacts && formData.contacts.length > 0) {
    formData.contacts.forEach((contact, index) => {
      // 担当者名の必須チェック
      if (!contact.contactName || contact.contactName.trim() === '') {
        errors[`contact_${index}_name`] = '担当者名は必須です';
      }

      // 担当者の電話番号フォーマットチェック
      if (contact.phone && !validatePhone(contact.phone)) {
        errors[`contact_${index}_phone`] = '電話番号は「03-1234-5678」形式で入力してください';
      }

      // 担当者のメールアドレスフォーマットチェック
      if (contact.email && !validateEmail(contact.email)) {
        errors[`contact_${index}_email`] = '正しいメールアドレス形式で入力してください';
      }

      // 担当者の連絡先情報の必須チェック
      if (!validateContactInfo(contact)) {
        errors[`contact_${index}_info`] = '電話番号またはメールアドレスのどちらかは必須です';
      }
    });
  }

  return errors;
};

/**
 * 電話番号の自動フォーマット
 * 数字とハイフンのみを残す
 */
export const formatPhoneInput = (phone) => {
  // 数字とハイフンのみを残す
  return phone.replace(/[^0-9-]/g, '');
};

/**
 * 郵便番号の自動フォーマット
 * 数字のみを残す
 */
export const formatPostalCodeInput = (postalCode) => {
  // 数字のみを残す
  return postalCode.replace(/[^0-9]/g, '');
};