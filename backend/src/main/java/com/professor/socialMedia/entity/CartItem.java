package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
public class CartItem {
    private ObjectId productId;
    private int quantity;

    private double priceSnapshot;

}
