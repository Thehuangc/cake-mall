package com.cakemall.seed;

import com.cakemall.module.user.User;
import com.cakemall.module.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
        createRiderIfNotExists();
    }

    private void createAdminIfNotExists() {
        String adminEmail = "admin@cake-mall.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("admin");
            userRepository.save(admin);
            System.out.println("管理员账号已创建: " + adminEmail);
        }
    }

    private void createRiderIfNotExists() {
        String riderEmail = "rider@cake-mall.com";
        if (!userRepository.existsByEmail(riderEmail)) {
            User rider = new User();
            rider.setUsername("rider");
            rider.setEmail(riderEmail);
            rider.setPasswordHash(passwordEncoder.encode("rider123"));
            rider.setRole("rider");
            userRepository.save(rider);
            System.out.println("骑手账号已创建: " + riderEmail);
        }
    }
}
