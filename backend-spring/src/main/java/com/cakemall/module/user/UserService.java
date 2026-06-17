package com.cakemall.module.user;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return toUserMap(user);
    }

    public Map<String, Object> updateProfile(Long userId, String username, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (username != null && !username.trim().isEmpty()) {
            if (!user.getUsername().equals(username) && userRepository.existsByUsername(username)) {
                throw new RuntimeException("用户名已存在");
            }
            user.setUsername(username.trim());
        }

        if (phone != null) {
            user.setPhone(phone.trim());
        }

        user = userRepository.save(user);
        return toUserMap(user);
    }

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("phone", user.getPhone());
        result.put("avatar", user.getAvatar());
        result.put("role", user.getRole());
        result.put("created_at", user.getCreatedAt());
        return result;
    }
}
