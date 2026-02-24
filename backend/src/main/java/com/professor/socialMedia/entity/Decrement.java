package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class Decrement {
    private ObjectId productId;
    private int quantity;

    public Decrement(ObjectId id, int quantity) {

        this.productId = id;
        this.quantity = quantity;
    }
}
