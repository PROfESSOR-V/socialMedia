package com.professor.socialMedia.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.professor.socialMedia.entity.ProductFaq;
import com.professor.socialMedia.entity.ProductVariant;
import com.professor.socialMedia.entity.ComboItem;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @Positive(message = "Discount percentage must be positive")
    private Double discountPercentage;
    private Integer priority;
    private Boolean showOnHomePage;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotNull(message = "Stock is required")
    @Positive(message = "Stock must be positive")
    private Integer stock;

    private String mainImage;
    private String hoverImage;
    private List<String> images;

    private String benefits;
    private String ingredients;
    private String howToUse;

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    private List<ProductVariant> variants;
    private List<ProductFaq> faqs;

    private boolean isCombo;
    private List<ComboItem> comboItems;
}
