package com.example.prmtool.service;

import com.example.prmtool.dto.PartnerRequest;
import com.example.prmtool.dto.PartnerResponse;
import com.example.prmtool.entity.Partner;
import com.example.prmtool.repository.PartnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
public class PartnerService {

    private final PartnerRepository partnerRepository;

    public PartnerService(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    @Transactional
    public PartnerResponse createPartner(PartnerRequest request) {
        Partner partner = Partner.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .build();

        Partner savedPartner = partnerRepository.save(
            Objects.requireNonNull(partner)
        );
        return PartnerResponse.from(savedPartner);
    }

    @Transactional(readOnly = true)
    public List<PartnerResponse> getAllPartners() {
        return partnerRepository.findAll().stream()
                .map(PartnerResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PartnerResponse getPartnerById(UUID id) {
        Partner partner = partnerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + id));
        return PartnerResponse.from(partner);
    }

    @Transactional
    public PartnerResponse updatePartner(UUID id, PartnerRequest request) {
        Partner partner = partnerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("パートナーが見つかりません: " + id));

        partner.setName(request.getName());
        partner.setAddress(request.getAddress());
        partner.setPhone(request.getPhone());

        Partner updatedPartner = partnerRepository.save(partner);
        return PartnerResponse.from(updatedPartner);
    }

    @Transactional
    public void deletePartner(UUID id) {
        if (!partnerRepository.existsById(Objects.requireNonNull(id))) {
            throw new RuntimeException("パートナーが見つかりません: " + id);
        }
        partnerRepository.deleteById(Objects.requireNonNull(id));
    }
}