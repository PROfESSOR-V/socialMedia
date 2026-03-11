package com.professor.socialMedia.dto;

import com.professor.socialMedia.entity.Address;
import com.professor.socialMedia.entity.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private String id;
    private String userId;
    private List<OrderItemDto> items;
    private Double totalAmount;
    private OrderStatus status;
    private com.professor.socialMedia.entity.ShipmentInfo shipment;
    private Address shippingAddress;
    private String paymentId;

    // Additional tracking fields
    private String paymentStatus;
    private String shipmentStatus;
    private String shipmozoMsg;
    private String shipmozoOrderId;
    private Instant refundRequestedAt;
    private Instant refundCompletedAt;
    private String refundReferenceId;

    // Customer details
    private String userName;
    private String userEmail;
    private String userPhone;

    private String cancelReason;

    // Coupon fields
    private String couponCode;
    private String couponHeading;
    private Double discountAmount;
    private String freeProductId;
    private String freeProductName;

    private Instant createdAt;
    private Instant updatedAt;
}
