package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "products")
@Data
public class Product {

    @Id
    private ObjectId id;
    private String name;
    private String description;

    private Double price;
    private String currency;
    private int stock;
    private List<String> images;
    private ObjectId categoryId;

    private boolean active = true;
    private Instant createdAt = Instant.now();
}
