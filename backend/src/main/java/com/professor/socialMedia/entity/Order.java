package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "orders")
@Data
public class Order {
    @Id
    private ObjectId id;

    private ObjectId userId;
    private List<OrderItem> items;

    private double totalAmount;
    private OrderStatus status = OrderStatus.CREATED;
    private ShipmentStatus shipmentStatus = ShipmentStatus.NOT_CREATED;
    private PaymentStatus paymentStatus = PaymentStatus.CREATED;

    private Address shippingAddress;
    private ObjectId paymentId;
    private ObjectId cartId;

    // Shiprocket/Shipmozo Tracking Fields
    private ShipmentInfo shipment;
    private String shipmozoMsg;
    private String shipmozoOrderId;

    // Refund Tracking Fields
    private Instant refundRequestedAt;
    private Instant refundCompletedAt;
    private String refundReferenceId;

    private String cancelReason;

    // Coupon Fields
    private String couponCode;
    private String couponHeading;
    private double discountAmount;
    private ObjectId freeProductId;
    private String freeProductName;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

}
