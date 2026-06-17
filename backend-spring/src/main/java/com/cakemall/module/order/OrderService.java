package com.cakemall.module.order;

import com.cakemall.module.cart.CartItem;
import com.cakemall.module.cart.CartRepository;
import com.cakemall.module.product.Product;
import com.cakemall.module.product.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Map<String, Object> createOrder(Long userId, Map<String, Object> address, String remark) {
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("购物车为空");
        }

        // 验证库存
        List<Product> products = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("商品不存在: " + cartItem.getProductId()));
            if (product.getStatus() != 1) {
                throw new RuntimeException("商品已下架: " + product.getName());
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("库存不足: " + product.getName());
            }
            products.add(product);
        }

        // 计算总金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (int i = 0; i < cartItems.size(); i++) {
            BigDecimal itemTotal = products.get(i).getPrice()
                    .multiply(BigDecimal.valueOf(cartItems.get(i).getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // 生成订单号
        String orderNo = generateOrderNo();

        // 创建订单
        Order order = new Order();
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus(0);
        order.setAddress(address != null ? address.toString() : "");
        order.setRemark(remark);

        // 创建订单项
        List<OrderItem> orderItems = new ArrayList<>();
        for (int i = 0; i < cartItems.size(); i++) {
            CartItem cartItem = cartItems.get(i);
            Product product = products.get(i);

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductImage(product.getImage());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            // 扣减库存，增加销量
            product.setStock(product.getStock() - cartItem.getQuantity());
            product.setSales(product.getSales() + cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setItems(orderItems);
        order = orderRepository.save(order);

        // 清空购物车
        cartRepository.deleteByUserId(userId);

        return toOrderMap(order);
    }

    public Map<String, Object> getOrders(Long userId, int page, int limit, Integer status) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            orderPage = orderRepository.findByUserId(userId, pageable);
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (Order order : orderPage.getContent()) {
            items.add(toOrderMap(order));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", orderPage.getTotalElements());
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", orderPage.getTotalPages());
        return result;
    }

    public Map<String, Object> getOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findByUserIdAndId(userId, orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        return toOrderMap(order);
    }

    @Transactional
    public Map<String, Object> cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByUserIdAndId(userId, orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != 0) {
            throw new RuntimeException("只能取消待付款订单");
        }

        // 恢复库存
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                product.setSales(product.getSales() - item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(4); // 已取消
        order = orderRepository.save(order);

        return toOrderMap(order);
    }

    private Map<String, Object> toOrderMap(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("order_no", order.getOrderNo());
        map.put("user_id", order.getUserId());
        map.put("total_amount", order.getTotalAmount());
        map.put("status", order.getStatus());
        map.put("address", order.getAddress());
        map.put("remark", order.getRemark());
        map.put("rider_id", order.getRiderId());
        map.put("commission", order.getCommission());
        map.put("delivered_at", order.getDeliveredAt());
        map.put("created_at", order.getCreatedAt());
        map.put("updated_at", order.getUpdatedAt());

        List<Map<String, Object>> items = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("product_id", item.getProductId());
                itemMap.put("product_name", item.getProductName());
                itemMap.put("product_image", item.getProductImage());
                itemMap.put("price", item.getPrice());
                itemMap.put("quantity", item.getQuantity());
                items.add(itemMap);
            }
        }
        map.put("items", items);

        return map;
    }

    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
        return timestamp + random;
    }
}
