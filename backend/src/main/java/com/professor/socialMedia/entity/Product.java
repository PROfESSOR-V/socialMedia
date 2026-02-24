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
    private String mainImage;
    private String hoverImage;
    private List<String> images;

    // Rich Text Fields
    private String benefits;
    private String ingredients;
    private String howToUse;
    private ObjectId categoryId;

    private boolean active = true;
    private Instant createdAt = Instant.now();

    public Boolean getActive() {
        return active;
    }
}
