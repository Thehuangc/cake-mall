package com.cakemall.module.cart;

import com.cakemall.module.product.Product;
import com.cakemall.module.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public Map<String, Object> getCart(Long userId) {
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        List<Map<String, Object>> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int count = 0;

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).orElse(null);
            if (product == null) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", cartItem.getId());
            item.put("product_id", cartItem.getProductId());
            item.put("quantity", cartItem.getQuantity());
            item.put("created_at", cartItem.getCreatedAt());

            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", product.getId());
            productMap.put("name", product.getName());
            productMap.put("price", product.getPrice());
            productMap.put("image", product.getImage());
            productMap.put("stock", product.getStock());
            productMap.put("status", product.getStatus());
            item.put("product", productMap);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            item.put("subtotal", itemTotal);
            total = total.add(itemTotal);
            count += cartItem.getQuantity();

            items.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", total);
        result.put("count", count);
        return result;
    }

    @Transactional
    public Map<String, Object> addItem(Long userId, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));

        if (product.getStatus() != 1) {
            throw new RuntimeException("商品已下架");
        }

        if (product.getStock() < quantity) {
            throw new RuntimeException("库存不足");
        }

        CartItem cartItem = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem = cartRepository.save(cartItem);
        } else {
            cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(productId);
            cartItem.setQuantity(quantity);
            cartItem = cartRepository.save(cartItem);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", cartItem.getId());
        result.put("product_id", cartItem.getProductId());
        result.put("quantity", cartItem.getQuantity());
        return result;
    }

    @Transactional
    public Map<String, Object> updateQuantity(Long userId, Long cartItemId, int quantity) {
        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("购物车项不存在"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作");
        }

        if (quantity <= 0) {
            cartRepository.delete(cartItem);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "已删除");
            return result;
        }

        Product product = productRepository.findById(cartItem.getProductId())
                .orElseThrow(() -> new RuntimeException("商品不存在"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("库存不足");
        }

        cartItem.setQuantity(quantity);
        cartItem = cartRepository.save(cartItem);

        Map<String, Object> result = new HashMap<>();
        result.put("id", cartItem.getId());
        result.put("product_id", cartItem.getProductId());
        result.put("quantity", cartItem.getQuantity());
        return result;
    }

    @Transactional
    public void removeItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("购物车项不存在"));

        if (!cartItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作");
        }

        cartRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }
}
