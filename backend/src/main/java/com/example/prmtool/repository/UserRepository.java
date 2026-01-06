package com.example.prmtool.repository;

import com.example.prmtool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    boolean existsByRole(User.UserRole role);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select count(u) from User u where u.role = :role")
    long countByRoleForUpdate(@Param("role") User.UserRole role);
}
