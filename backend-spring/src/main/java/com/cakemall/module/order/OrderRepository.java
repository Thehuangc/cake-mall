package com.cakemall.module.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndStatus(Long userId, Integer status, Pageable pageable);

    List<Order> findByUserId(Long userId);

    Optional<Order> findByUserIdAndId(Long userId, Long id);

    List<Order> findByStatusAndRiderIdIsNull(Integer status);

    List<Order> findByRiderId(Integer riderId);

    Page<Order> findByRiderId(Integer riderId, Pageable pageable);

    Page<Order> findByRiderIdAndStatus(Integer riderId, Integer status, Pageable pageable);

    long countByRiderId(Integer riderId);

    long countByRiderIdAndStatus(Integer riderId, Integer status);
}
