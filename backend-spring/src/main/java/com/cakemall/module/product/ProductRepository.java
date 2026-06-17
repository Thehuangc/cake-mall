package com.cakemall.module.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findByStatus(Integer status);

    Page<Product> findByStatus(Integer status, Pageable pageable);

    List<Product> findByCategoryIdAndStatus(Integer categoryId, Integer status);

    Page<Product> findByNameContainingAndStatus(String name, Integer status, Pageable pageable);

    long countByStatus(Integer status);
}
