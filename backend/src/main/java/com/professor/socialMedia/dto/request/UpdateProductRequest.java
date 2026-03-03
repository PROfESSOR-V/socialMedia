package com.professor.socialMedia.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.professor.socialMedia.entity.ProductVariant;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private String name;
    private String description;
    private Double discountPercentage;
    private Integer priority;
    private Boolean showOnHomePage;
    private String currency;
    private Integer stock;
    private String mainImage;
    private String hoverImage;
    private List<String> images;

    private String benefits;
    private String ingredients;
    private String howToUse;
    private String categoryId;
    private List<ProductVariant> variants;
}
