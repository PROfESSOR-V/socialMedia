package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "coupons")
@Data
public class Coupon {
    @Id
    private ObjectId id;

    @Indexed(unique = true)
    private String code; // Uppercase, unique

    private String heading; // Admin-set label e.g. "Diwali Offer", "New User Special"

    private CouponType couponType; // DISCOUNT or PRODUCT

    private boolean active = true;

    // --- DISCOUNT type fields ---
    private Double discountAmount; // Flat ₹ off
    private CouponUserCondition userCondition; // NEW_USER or ALL_USERS

    // --- PRODUCT type fields ---
    private ObjectId freeProductId; // Product to add for free
    private Integer minCartItems; // Minimum number of items in cart
    private Double minOrderValue; // Minimum order subtotal

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
