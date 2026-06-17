package com.cakemall.module.auth;

import com.cakemall.config.JwtUtil;
import com.cakemall.module.auth.dto.LoginDto;
import com.cakemall.module.auth.dto.RegisterDto;
import com.cakemall.module.user.User;
import com.cakemall.module.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> register(RegisterDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole("user");

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("user", userMap);
        result.put("token", token);
        return result;
    }

    public Map<String, Object> login(LoginDto dto) {
        // 支持邮箱或用户名登录
        User user = userRepository.findByEmail(dto.getEmail())
                .or(() -> userRepository.findByUsername(dto.getEmail()))
                .orElse(null);

        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("账号或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("avatar", user.getAvatar());
        userMap.put("role", user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("user", userMap);
        result.put("token", token);
        return result;
    }

    public Map<String, Object> adminLogin(LoginDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .or(() -> userRepository.findByUsername(dto.getEmail()))
                .orElse(null);

        if (user == null || !"admin".equals(user.getRole())) {
            throw new RuntimeException("管理员账号或密码错误");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("管理员账号或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("user", userMap);
        result.put("token", token);
        return result;
    }

    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

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
