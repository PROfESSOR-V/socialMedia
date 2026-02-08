package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;


@Document(collection = "carts")
@Data
public class Cart {
    @Id
    private ObjectId id;

    private ObjectId userId;

    private List<CartItem> items;

    private Instant createdAt =  Instant.now();
    private Instant updatedAt = Instant.now();
}
