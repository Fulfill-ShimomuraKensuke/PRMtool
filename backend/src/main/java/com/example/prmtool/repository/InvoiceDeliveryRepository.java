package com.example.prmtool.repository;

import com.example.prmtool.entity.InvoiceDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 請求書送付履歴リポジトリ
 */
@Repository
public interface InvoiceDeliveryRepository extends JpaRepository<InvoiceDelivery, UUID> {

  /**
   * 指定した請求書の送付履歴を取得
   * 送信日時の降順で返却
   */
  List<InvoiceDelivery> findByInvoiceIdOrderBySentAtDesc(UUID invoiceId);

  /**
   * 指定した送信者の送付履歴を取得
   * 送信日時の降順で返却
   */
  List<InvoiceDelivery> findBySentByIdOrderBySentAtDesc(UUID sentById);

  /**
   * 指定したステータスの送付履歴を取得
   * 送信日時の降順で返却
   */
  List<InvoiceDelivery> findByStatusOrderBySentAtDesc(InvoiceDelivery.DeliveryStatus status);
}