package com.cakemall.module.product;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(name = "category_id", required = false) Integer categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort) {
        try {
            Page<Product> productPage = productService.findAll(page, limit, categoryId, keyword, sort);

            List<Map<String, Object>> items = productPage.getContent().stream()
                    .map(this::toProductMap)
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("items", items);
            result.put("total", productPage.getTotalElements());
            result.put("page", page);
            result.put("limit", limit);
            result.put("totalPages", productPage.getTotalPages());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/hot")
    public ResponseEntity<?> hot() {
        try {
            List<Map<String, Object>> items = productService.findHot().stream()
                    .map(this::toProductMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/new")
    public ResponseEntity<?> newProducts() {
        try {
            List<Map<String, Object>> items = productService.findNew().stream()
                    .map(this::toProductMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        try {
            Product product = productService.findById(id);
            return ResponseEntity.ok(toProductMap(product));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, Object> toProductMap(Product product) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", product.getId());
        map.put("name", product.getName());
        map.put("description", product.getDescription());
        map.put("price", product.getPrice());
        map.put("original_price", product.getOriginalPrice());
        map.put("image", product.getImage());
        map.put("images", product.getImages());
        map.put("category_id", product.getCategoryId());
        map.put("stock", product.getStock());
        map.put("sales", product.getSales());
        map.put("status", product.getStatus());
        map.put("created_at", product.getCreatedAt());
        if (product.getCategory() != null) {
            Map<String, Object> catMap = new HashMap<>();
            catMap.put("id", product.getCategory().getId());
            catMap.put("name", product.getCategory().getName());
            catMap.put("icon", product.getCategory().getIcon());
            map.put("category", catMap);
        }
        return map;
    }
}
