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

    private Address shippingAddress;
    private ObjectId paymentId;

    private Instant createdAt= Instant.now();


}
