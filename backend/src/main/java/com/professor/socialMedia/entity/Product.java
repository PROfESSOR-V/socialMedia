package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "products")
@Data
public class Product {

    @Id
    private ObjectId id;
    private String name;
    private String description;

    private Double discountPercentage;
    private String currency;
    private int stock;
    private String mainImage;
    private String hoverImage;
    private List<String> images;

    private List<ProductVariant> variants;
    private List<ProductFaq> faqs = new ArrayList<>();

    // Rich Text Fields
    private String benefits;
    private String ingredients;
    private String howToUse;
    private ObjectId categoryId;
    private boolean isCombo = false;
    private List<ComboItem> comboItems = new ArrayList<>();

    private boolean active = true;
    private Integer priority = 0;
    private boolean showOnHomePage = false;
    private Instant createdAt = Instant.now();

    public Boolean getActive() {
        return active;
    }
}
