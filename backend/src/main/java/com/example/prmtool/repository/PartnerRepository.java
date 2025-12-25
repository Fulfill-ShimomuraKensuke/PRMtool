package com.example.prmtool.repository;

import com.example.prmtool.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, UUID> {
}