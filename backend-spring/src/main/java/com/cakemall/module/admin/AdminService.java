package com.cakemall.module.admin;

import com.cakemall.module.cart.CartRepository;
import com.cakemall.module.category.Category;
import com.cakemall.module.category.CategoryRepository;
import com.cakemall.module.order.Order;
import com.cakemall.module.order.OrderItem;
import com.cakemall.module.order.OrderRepository;
import com.cakemall.module.product.Product;
import com.cakemall.module.product.ProductRepository;
import com.cakemall.module.user.User;
import com.cakemall.module.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, ProductRepository productRepository,
                        CategoryRepository categoryRepository, OrderRepository orderRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==================== Dashboard ====================

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("userCount", userRepository.count());
        stats.put("productCount", productRepository.count());
        stats.put("orderCount", orderRepository.count());

        BigDecimal totalSales = BigDecimal.ZERO;
        for (Order order : orderRepository.findAll()) {
            if (order.getStatus() >= 1 && order.getStatus() <= 3) {
                totalSales = totalSales.add(order.getTotalAmount());
            }
        }
        stats.put("totalSales", totalSales);
        return stats;
    }

    // ==================== User CRUD ====================

    public Map<String, Object> getUsers(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(pageable);

        List<Map<String, Object>> items = new ArrayList<>();
        for (User user : userPage.getContent()) {
            items.add(toUserMap(user));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", userPage.getTotalElements());
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", userPage.getTotalPages());
        return result;
    }

    public Map<String, Object> getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return toUserMap(user);
    }

    public Map<String, Object> createUser(Map<String, Object> body) {
        User user = new User();
        user.setUsername(body.get("username").toString());
        user.setEmail(body.get("email").toString());
        user.setPasswordHash(passwordEncoder.encode(body.get("password").toString()));
        user.setRole(body.containsKey("role") ? body.get("role").toString() : "user");
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone").toString());
        }
        user = userRepository.save(user);
        return toUserMap(user);
    }

    public Map<String, Object> updateUser(Long id, Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (body.containsKey("username")) {
            user.setUsername(body.get("username").toString());
        }
        if (body.containsKey("email")) {
            user.setEmail(body.get("email").toString());
        }
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone").toString());
        }
        if (body.containsKey("role")) {
            user.setRole(body.get("role").toString());
        }
        if (body.containsKey("password") && body.get("password") != null
                && !body.get("password").toString().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(body.get("password").toString()));
        }

        user = userRepository.save(user);
        return toUserMap(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("用户不存在");
        }
        userRepository.deleteById(id);
    }

    // ==================== Product CRUD ====================

    public Map<String, Object> getProducts(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "id"));
        Page<Product> productPage = productRepository.findAll(pageable);

        List<Map<String, Object>> items = new ArrayList<>();
        for (Product product : productPage.getContent()) {
            items.add(toProductMap(product));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", productPage.getTotalElements());
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", productPage.getTotalPages());
        return result;
    }

    public Map<String, Object> getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        return toProductMap(product);
    }

    public Map<String, Object> createProduct(Map<String, Object> body) {
        Product product = new Product();
        product.setName(body.get("name").toString());
        product.setDescription(body.containsKey("description") ? body.get("description").toString() : null);
        product.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.containsKey("original_price") && body.get("original_price") != null) {
            product.setOriginalPrice(new BigDecimal(body.get("original_price").toString()));
        }
        product.setImage(body.containsKey("image") ? body.get("image").toString() : null);
        product.setImages(body.containsKey("images") ? body.get("images").toString() : null);
        if (body.containsKey("category_id") && body.get("category_id") != null) {
            product.setCategoryId(Integer.parseInt(body.get("category_id").toString()));
        }
        product.setStock(body.containsKey("stock") ? Integer.parseInt(body.get("stock").toString()) : 0);
        product.setStatus(body.containsKey("status") ? Integer.parseInt(body.get("status").toString()) : 1);

        product = productRepository.save(product);
        return toProductMap(product);
    }

    public Map<String, Object> updateProduct(Long id, Map<String, Object> body) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在"));

        if (body.containsKey("name")) product.setName(body.get("name").toString());
        if (body.containsKey("description")) product.setDescription(body.get("description").toString());
        if (body.containsKey("price")) product.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.containsKey("original_price")) {
            product.setOriginalPrice(body.get("original_price") != null
                    ? new BigDecimal(body.get("original_price").toString()) : null);
        }
        if (body.containsKey("image")) product.setImage(body.get("image").toString());
        if (body.containsKey("images")) product.setImages(body.get("images").toString());
        if (body.containsKey("category_id")) {
            product.setCategoryId(body.get("category_id") != null
                    ? Integer.parseInt(body.get("category_id").toString()) : null);
        }
        if (body.containsKey("stock")) product.setStock(Integer.parseInt(body.get("stock").toString()));
        if (body.containsKey("status")) product.setStatus(Integer.parseInt(body.get("status").toString()));

        product = productRepository.save(product);
        return toProductMap(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("商品不存在");
        }
        productRepository.deleteById(id);
    }

    // ==================== Category CRUD ====================

    public List<Map<String, Object>> getCategories() {
        List<Map<String, Object>> items = new ArrayList<>();
        for (Category category : categoryRepository.findAllByOrderBySortOrderAsc()) {
            items.add(toCategoryMap(category));
        }
        return items;
    }

    public Map<String, Object> getCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        return toCategoryMap(category);
    }

    public Map<String, Object> createCategory(Map<String, Object> body) {
        Category category = new Category();
        category.setName(body.get("name").toString());
        category.setIcon(body.containsKey("icon") ? body.get("icon").toString() : null);
        category.setSortOrder(body.containsKey("sort_order")
                ? Integer.parseInt(body.get("sort_order").toString()) : 0);
        category = categoryRepository.save(category);
        return toCategoryMap(category);
    }

    public Map<String, Object> updateCategory(Integer id, Map<String, Object> body) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在"));

        if (body.containsKey("name")) category.setName(body.get("name").toString());
        if (body.containsKey("icon")) category.setIcon(body.get("icon").toString());
        if (body.containsKey("sort_order")) {
            category.setSortOrder(Integer.parseInt(body.get("sort_order").toString()));
        }

        category = categoryRepository.save(category);
        return toCategoryMap(category);
    }

    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("分类不存在");
        }
        categoryRepository.deleteById(id);
    }

    // ==================== Order Management ====================

    public Map<String, Object> getOrders(int page, int limit, Integer status) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findAll(pageable); // Use custom query if needed
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (Order order : orderPage.getContent()) {
            if (status == null || order.getStatus().equals(status)) {
                items.add(toOrderMap(order));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", orderPage.getTotalElements());
        result.put("page", page);
        result.put("limit", limit);
        result.put("totalPages", orderPage.getTotalPages());
        return result;
    }

    public Map<String, Object> getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        return toOrderMap(order);
    }

    @Transactional
    public Map<String, Object> setCommission(Long orderId, BigDecimal commission) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        order.setCommission(commission);
        order = orderRepository.save(order);
        return toOrderMap(order);
    }

    @Transactional
    public Map<String, Object> updateOrderStatus(Long orderId, Integer status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        // 验证状态流转
        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new RuntimeException("无效的状态变更: " + order.getStatus() + " -> " + status);
        }

        order.setStatus(status);
        if (status == 3) {
            order.setDeliveredAt(java.time.LocalDateTime.now());
        }
        order = orderRepository.save(order);
        return toOrderMap(order);
    }

    private boolean isValidStatusTransition(int current, int next) {
        // 0:待付款 1:待配送 2:配送中 3:已完成 4:已取消
        return switch (current) {
            case 0 -> next == 1 || next == 4; // 待付款 -> 待配送/已取消
            case 1 -> next == 2 || next == 4; // 待配送 -> 配送中/已取消
            case 2 -> next == 3;              // 配送中 -> 已完成
            default -> false;
        };
    }

    // ==================== File Upload ====================

    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID().toString() + ext;

        Path filePath = Paths.get(uploadDir, filename);
        Files.copy(file.getInputStream(), filePath);

        Map<String, Object> result = new HashMap<>();
        result.put("url", "/uploads/" + filename);
        result.put("filename", filename);
        return result;
    }

    // ==================== Helper Methods ====================

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("avatar", user.getAvatar());
        map.put("role", user.getRole());
        map.put("created_at", user.getCreatedAt());
        return map;
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

    private Map<String, Object> toCategoryMap(Category category) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", category.getId());
        map.put("name", category.getName());
        map.put("icon", category.getIcon());
        map.put("sort_order", category.getSortOrder());
        map.put("created_at", category.getCreatedAt());
        return map;
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
