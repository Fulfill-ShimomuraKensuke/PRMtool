package com.example.prmtool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partner {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;  // 企業名（必須）

    @Column
    private String phone;  // 代表電話（任意）

    @Column
    private String address;  // 住所（任意）

    // 追加: 複数の担当者
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PartnerContact> contacts = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 追加: 担当者を追加するヘルパーメソッド
    public void addContact(PartnerContact contact) {
        contacts.add(contact);
        contact.setPartner(this);
    }

    // 追加: 担当者を削除するヘルパーメソッド
    public void removeContact(PartnerContact contact) {
        contacts.remove(contact);
        contact.setPartner(null);
    }
}