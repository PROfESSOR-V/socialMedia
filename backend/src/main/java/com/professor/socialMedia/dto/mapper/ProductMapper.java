package com.professor.socialMedia.dto.mapper;

import com.professor.socialMedia.dto.ProductDto;
import com.professor.socialMedia.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {
    public ProductDto mapProduct(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId().toString());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCurrency(product.getCurrency());
        dto.setStock(product.getStock());
        dto.setMainImage(product.getMainImage());
        dto.setHoverImage(product.getHoverImage());
        dto.setImages(product.getImages());

        dto.setBenefits(product.getBenefits());
        dto.setIngredients(product.getIngredients());
        dto.setHowToUse(product.getHowToUse());
        dto.setCategoryId(product.getCategoryId() != null ? product.getCategoryId().toString() : null);
        dto.setIsActive(product.getActive());
        dto.setVariants(product.getVariants());
        return dto;
    }
}
