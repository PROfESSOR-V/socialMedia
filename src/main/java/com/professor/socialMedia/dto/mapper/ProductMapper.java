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
        dto.setImages(product.getImages());
        dto.setCategoryId(product.getCategoryId() != null ? product.getCategoryId().toString() : null);
        dto.setIsActive(product.getActive());
        return dto;
    }
}
