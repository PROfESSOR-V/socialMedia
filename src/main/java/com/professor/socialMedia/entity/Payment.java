package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "payments")
@Data
public class Payment {
    @Id
    private ObjectId id;

    private ObjectId orderId;
    private String provider; // razorpay / juspay
    private String providerPaymentId;
    private PaymentStatus status;
    private double amount;
    private Map<String, Object> metadata;

    private Instant  createdAt = Instant.now();

}
