package com.cakemall.module.rider;

import com.cakemall.module.order.Order;
import com.cakemall.module.order.OrderItem;
import com.cakemall.module.order.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class RiderService {

    private final OrderRepository orderRepository;

    public RiderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> getAvailableOrders(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        // 获取状态为1(待配送)且没有骑手的订单
        List<Order> availableOrders = orderRepository.findByStatusAndRiderIdIsNull(1);

        int start = (page - 1) * limit;
        int end = Math.min(start + limit, availableOrders.size());
        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = start; i < end; i++) {
            items.add(toOrderMap(availableOrders.get(i)));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", (long) availableOrders.size());
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", (int) Math.ceil((double) availableOrders.size() / limit));
        return result;
    }

    public Map<String, Object> getMyOrders(Integer riderId, int page, int limit, Integer status) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findByRiderIdAndStatus(riderId, status, pageable);
        } else {
            orderPage = orderRepository.findByRiderId(riderId, pageable);
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

    @Transactional
    public Map<String, Object> acceptOrder(Integer riderId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != 1) {
            throw new RuntimeException("该订单不可接取");
        }

        if (order.getRiderId() != null) {
            throw new RuntimeException("该订单已被其他骑手接取");
        }

        order.setRiderId(riderId);
        order = orderRepository.save(order);
        return toOrderMap(order);
    }

    @Transactional
    public Map<String, Object> pickupOrder(Integer riderId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!riderId.equals(order.getRiderId())) {
            throw new RuntimeException("无权操作此订单");
        }

        if (order.getStatus() != 1) {
            throw new RuntimeException("订单状态不正确，当前状态: " + order.getStatus());
        }

        order.setStatus(2); // 配送中
        order = orderRepository.save(order);
        return toOrderMap(order);
    }

    @Transactional
    public Map<String, Object> deliverOrder(Integer riderId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (!riderId.equals(order.getRiderId())) {
            throw new RuntimeException("无权操作此订单");
        }

        if (order.getStatus() != 2) {
            throw new RuntimeException("订单状态不正确，当前状态: " + order.getStatus());
        }

        order.setStatus(3); // 已完成
        order.setDeliveredAt(LocalDateTime.now());
        // 自动计算佣金：订单金额的10%
        BigDecimal commission = order.getTotalAmount().multiply(new BigDecimal("0.10"))
                .setScale(2, java.math.RoundingMode.HALF_UP);
        order.setCommission(commission);
        order = orderRepository.save(order);
        return toOrderMap(order);
    }

    public Map<String, Object> getStats(Integer riderId) {
        long totalOrders = orderRepository.countByRiderId(riderId);
        long pendingOrders = orderRepository.countByRiderIdAndStatus(riderId, 1)
                + orderRepository.countByRiderIdAndStatus(riderId, 2);

        // 计算今日订单数
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        long todayOrders = 0;
        BigDecimal totalCommission = BigDecimal.ZERO;

        List<Order> allOrders = orderRepository.findByRiderId(riderId);
        for (Order order : allOrders) {
            if (order.getCreatedAt().isAfter(todayStart)) {
                todayOrders++;
            }
            if (order.getCommission() != null && order.getStatus() == 3) {
                totalCommission = totalCommission.add(order.getCommission());
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("todayOrders", todayOrders);
        stats.put("totalCommission", totalCommission);
        stats.put("pendingOrders", pendingOrders);
        return stats;
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
}
