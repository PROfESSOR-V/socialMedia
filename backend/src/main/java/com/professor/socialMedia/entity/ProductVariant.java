package com.professor.socialMedia.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {
    private String name; // e.g., "50ml", "100ml", "Large"
    private Double actualPrice;
    private Double discountPrice;
    private int stock;
}
