package com.cakemall.module.rider;

import com.cakemall.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/rider")
public class RiderController {

    private final RiderService riderService;
    private final JwtUtil jwtUtil;

    public RiderController(RiderService riderService, JwtUtil jwtUtil) {
        this.riderService = riderService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/orders")
    public ResponseEntity<?> availableOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(riderService.getAvailableOrders(page, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> myOrders(
            Authentication auth,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer status) {
        try {
            Long userId = (Long) auth.getPrincipal();
            Integer riderId = userId.intValue();
            return ResponseEntity.ok(riderService.getMyOrders(riderId, page, limit, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/accept")
    public ResponseEntity<?> acceptOrder(Authentication auth, @PathVariable Long id) {
        try {
            Long userId = (Long) auth.getPrincipal();
            Integer riderId = userId.intValue();
            return ResponseEntity.ok(riderService.acceptOrder(riderId, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/pickup")
    public ResponseEntity<?> pickupOrder(Authentication auth, @PathVariable Long id) {
        try {
            Long userId = (Long) auth.getPrincipal();
            Integer riderId = userId.intValue();
            return ResponseEntity.ok(riderService.pickupOrder(riderId, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/deliver")
    public ResponseEntity<?> deliverOrder(Authentication auth, @PathVariable Long id) {
        try {
            Long userId = (Long) auth.getPrincipal();
            Integer riderId = userId.intValue();
            return ResponseEntity.ok(riderService.deliverOrder(riderId, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            Integer riderId = userId.intValue();
            return ResponseEntity.ok(riderService.getStats(riderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
