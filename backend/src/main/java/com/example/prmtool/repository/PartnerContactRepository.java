package com.example.prmtool.repository;

import com.example.prmtool.entity.PartnerContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PartnerContactRepository extends JpaRepository<PartnerContact, UUID> {
    
    // パートナーIDで担当者を検索
    List<PartnerContact> findByPartnerId(UUID partnerId);
    
    // パートナーIDで担当者を削除
    void deleteByPartnerId(UUID partnerId);
}