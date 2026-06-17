package com.cakemall.module.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> findAll(int page, int limit, Integer categoryId, String keyword, String sort) {
        Sort sorting;
        if ("price_asc".equals(sort)) {
            sorting = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equals(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "price");
        } else if ("sales".equals(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "sales");
        } else if ("newest".equals(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        } else {
            sorting = Sort.by(Sort.Direction.DESC, "id");
        }

        Pageable pageable = PageRequest.of(page - 1, limit, sorting);

        Specification<Product> spec = Specification.where((root, query, cb) -> cb.equal(root.get("status"), 1));

        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("categoryId"), categoryId));
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(root.get("name"), "%" + keyword.trim() + "%"));
        }

        return productRepository.findAll(spec, pageable);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
    }

    public java.util.List<Product> findHot() {
        Pageable pageable = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "sales"));
        return productRepository.findByStatus(1, pageable).getContent();
    }

    public java.util.List<Product> findNew() {
        Pageable pageable = PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByStatus(1, pageable).getContent();
    }
}
