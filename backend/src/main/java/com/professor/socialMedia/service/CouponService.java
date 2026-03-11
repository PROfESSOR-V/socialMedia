package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.*;
import com.professor.socialMedia.repository.CouponRepository;
import com.professor.socialMedia.repository.OrderRepository;
import com.professor.socialMedia.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // ==================== Admin CRUD ====================

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon createCoupon(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase().trim());
        coupon.setCreatedAt(Instant.now());
        coupon.setUpdatedAt(Instant.now());

        // Validate based on type
        if (coupon.getCouponType() == CouponType.DISCOUNT) {
            if (coupon.getDiscountAmount() == null || coupon.getDiscountAmount() <= 0) {
                throw new IllegalArgumentException("Discount amount must be greater than 0");
            }
            if (coupon.getUserCondition() == null) {
                coupon.setUserCondition(CouponUserCondition.ALL_USERS);
            }
        } else if (coupon.getCouponType() == CouponType.PRODUCT) {
            if (coupon.getFreeProductId() == null) {
                throw new IllegalArgumentException("Free product must be selected for product coupon");
            }
            if (coupon.getMinCartItems() == null || coupon.getMinCartItems() < 1) {
                coupon.setMinCartItems(1);
            }
            if (coupon.getMinOrderValue() == null || coupon.getMinOrderValue() < 0) {
                coupon.setMinOrderValue(0.0);
            }
        }

        // Check for duplicate code
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists: " + coupon.getCode());
        }

        return couponRepository.save(coupon);
    }

    public Coupon updateCoupon(ObjectId id, Coupon updated) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        existing.setCode(updated.getCode().toUpperCase().trim());
        existing.setHeading(updated.getHeading());
        existing.setCouponType(updated.getCouponType());
        existing.setActive(updated.isActive());
        existing.setDiscountAmount(updated.getDiscountAmount());
        existing.setUserCondition(updated.getUserCondition());
        existing.setFreeProductId(updated.getFreeProductId());
        existing.setMinCartItems(updated.getMinCartItems());
        existing.setMinOrderValue(updated.getMinOrderValue());
        existing.setUpdatedAt(Instant.now());

        return couponRepository.save(existing);
    }

    public void deleteCoupon(ObjectId id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found");
        }
        couponRepository.deleteById(id);
    }

    // ==================== Validate & Apply ====================

    /**
     * Validate a coupon against the user's context.
     * Returns a map with validation result and coupon details.
     */
    public Map<String, Object> validateAndApply(String code, ObjectId userId, int cartItemCount, double subtotal) {
        Map<String, Object> result = new HashMap<>();

        Coupon coupon = couponRepository.findByCode(code.toUpperCase().trim())
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new RuntimeException("This coupon is no longer active");
        }

        if (coupon.getCouponType() == CouponType.DISCOUNT) {
            // Check user condition
            if (coupon.getUserCondition() == CouponUserCondition.NEW_USER) {
                // Check if user has any paid orders
                List<Order> paidOrders = orderRepository.findByUserId(userId);
                boolean hasPaidOrder = paidOrders.stream()
                        .anyMatch(o -> o.getStatus() == OrderStatus.PAID
                                || o.getStatus() == OrderStatus.DELIVERED);
                if (hasPaidOrder) {
                    throw new RuntimeException("This coupon is only for first-time buyers");
                }
            }

            double discount = coupon.getDiscountAmount();
            if (discount > subtotal) {
                discount = subtotal; // Cap discount at subtotal
            }

            result.put("valid", true);
            result.put("type", "DISCOUNT");
            result.put("discountAmount", discount);
            result.put("heading", coupon.getHeading());
            result.put("code", coupon.getCode());

        } else if (coupon.getCouponType() == CouponType.PRODUCT) {
            // Check minimum cart items
            if (coupon.getMinCartItems() != null && cartItemCount < coupon.getMinCartItems()) {
                throw new RuntimeException("Minimum " + coupon.getMinCartItems() + " items required in cart");
            }
            // Check minimum order value
            if (coupon.getMinOrderValue() != null && subtotal < coupon.getMinOrderValue()) {
                throw new RuntimeException("Minimum order value of ₹" + coupon.getMinOrderValue().intValue() + " required");
            }

            // Get product details
            Product freeProduct = productRepository.findById(coupon.getFreeProductId())
                    .orElseThrow(() -> new RuntimeException("Free product not found"));

            result.put("valid", true);
            result.put("type", "PRODUCT");
            result.put("freeProductId", coupon.getFreeProductId().toString());
            result.put("freeProductName", freeProduct.getName());
            result.put("freeProductImage", freeProduct.getMainImage());
            result.put("heading", coupon.getHeading());
            result.put("code", coupon.getCode());
        }

        return result;
    }
}
