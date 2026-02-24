package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;


@Data
public class OrderItem {

    private ObjectId productId;
    private int quantity;

    private double priceSnapshot;

}
