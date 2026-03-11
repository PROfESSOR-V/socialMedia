package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Coupon;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.CouponService;
import com.professor.socialMedia.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private UserService userService;

    // ==================== Admin Endpoints ====================

    @GetMapping("/api/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllCoupons();
        List<Map<String, Object>> result = coupons.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId().toString());
            map.put("code", c.getCode());
            map.put("heading", c.getHeading());
            map.put("couponType", c.getCouponType().name());
            map.put("active", c.isActive());
            map.put("discountAmount", c.getDiscountAmount());
            map.put("discountPercentage", c.getDiscountPercentage());
            map.put("userCondition", c.getUserCondition() != null ? c.getUserCondition().name() : null);
            map.put("freeProductId", c.getFreeProductId() != null ? c.getFreeProductId().toString() : null);
            map.put("minCartItems", c.getMinCartItems());
            map.put("minOrderValue", c.getMinOrderValue());
            map.put("createdAt", c.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved successfully", result));
    }

    @PostMapping("/api/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            Coupon created = couponService.createCoupon(coupon);
            Map<String, Object> map = new HashMap<>();
            map.put("id", created.getId().toString());
            map.put("code", created.getCode());
            map.put("heading", created.getHeading());
            map.put("couponType", created.getCouponType().name());
            map.put("active", created.isActive());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coupon created successfully", map));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/api/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCoupon(@PathVariable String id, @RequestBody Coupon coupon) {
        try {
            Coupon updated = couponService.updateCoupon(new ObjectId(id), coupon);
            Map<String, Object> map = new HashMap<>();
            map.put("id", updated.getId().toString());
            map.put("code", updated.getCode());
            map.put("heading", updated.getHeading());
            map.put("couponType", updated.getCouponType().name());
            map.put("active", updated.isActive());
            return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", map));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable String id) {
        try {
            couponService.deleteCoupon(new ObjectId(id));
            return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== User Endpoint ====================

    @PostMapping("/api/coupons/apply")
    public ResponseEntity<?> applyCoupon(
            @AuthenticationPrincipal CustomUserDetail userDetail,
            @RequestBody Map<String, Object> request) {
        try {
            User user = userService.findByMobileNumber(userDetail.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found!"));

            String code = (String) request.get("code");
            int cartItemCount = request.get("cartItemCount") != null
                    ? ((Number) request.get("cartItemCount")).intValue() : 0;
            double subtotal = request.get("subtotal") != null
                    ? ((Number) request.get("subtotal")).doubleValue() : 0.0;

            Map<String, Object> result = couponService.validateAndApply(code, user.getId(), cartItemCount, subtotal);
            return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }
}
