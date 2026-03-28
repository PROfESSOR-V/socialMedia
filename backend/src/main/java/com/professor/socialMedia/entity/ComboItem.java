package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class ComboItem {
    private ObjectId productId;
    private String productName;
    private int quantity;
}
