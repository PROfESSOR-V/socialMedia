package com.professor.socialMedia.controler;

import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.repository.OrderRepository;
import com.professor.socialMedia.repository.ProductRepository;
import com.professor.socialMedia.repository.UserRepository;
import com.professor.socialMedia.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardMetrics() {
        List<Order> allOrders = orderRepository.findAll();

        long totalOrders = allOrders.size();
        double totalRevenue = allOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.count();

        List<Order> recentOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRevenue", totalRevenue);
        metrics.put("totalOrders", totalOrders);
        metrics.put("totalProducts", totalProducts);
        metrics.put("totalCustomers", totalCustomers);

        List<Map<String, Object>> recentActivity = recentOrders.stream().map(o -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId().toString());
            map.put("amount", o.getTotalAmount());
            map.put("status", o.getStatus() != null ? o.getStatus().name() : "UNKNOWN");
            map.put("date", o.getCreatedAt());
            map.put("customer", o.getShippingAddress() != null ? o.getShippingAddress().getName() : "Unknown");
            return map;
        }).collect(Collectors.toList());

        metrics.put("recentActivity", recentActivity);

        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", metrics));
    }
}
