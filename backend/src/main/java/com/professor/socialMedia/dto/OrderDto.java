package com.professor.socialMedia.dto;

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
    private String awb;
    private String courier;
    private String trackingStatus;
    private Object trackingData;

    // Additional tracking fields
    private String paymentStatus;
    private String shipmentStatus;
    private Instant refundRequestedAt;
    private Instant refundCompletedAt;
    private String refundReferenceId;

    private Instant createdAt;
    private Instant updatedAt;
}
