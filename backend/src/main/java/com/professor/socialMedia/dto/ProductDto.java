package com.professor.socialMedia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.professor.socialMedia.entity.ProductFaq;
import com.professor.socialMedia.entity.ProductVariant;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private String id;
    private String name;
    private String description;
    private Double discountPercentage;
    private String currency;
    private Integer stock;
    private String mainImage;
    private String hoverImage;
    private List<String> images;

    // Rich Text Fields
    private String benefits;
    private String ingredients;
    private String howToUse;
    private String categoryId;
    private CategoryDto category;
    private Boolean isActive;
    private Integer priority;
    private Boolean showOnHomePage;
    private List<ProductVariant> variants;
    private List<ProductFaq> faqs;
}
