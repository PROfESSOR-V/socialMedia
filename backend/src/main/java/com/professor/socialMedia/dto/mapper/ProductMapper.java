package com.professor.socialMedia.dto.mapper;

import com.professor.socialMedia.dto.ProductDto;
import com.professor.socialMedia.entity.Product;
import com.professor.socialMedia.repository.CategoryRepository;
import com.professor.socialMedia.dto.CategoryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {
    @Autowired
    private CategoryRepository categoryRepository;

    public ProductDto mapProduct(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId().toString());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setDiscountPercentage(product.getDiscountPercentage());
        dto.setCurrency(product.getCurrency());
        dto.setStock(product.getStock());
        dto.setMainImage(product.getMainImage());
        dto.setHoverImage(product.getHoverImage());
        dto.setImages(product.getImages());

        dto.setBenefits(product.getBenefits());
        dto.setIngredients(product.getIngredients());
        dto.setHowToUse(product.getHowToUse());
        dto.setCategoryId(product.getCategoryId() != null ? product.getCategoryId().toString() : null);

        if (product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId()).ifPresent(cat -> {
                CategoryDto catDto = new CategoryDto();
                catDto.setId(cat.getId().toString());
                catDto.setName(cat.getName());
                dto.setCategory(catDto);
            });
        }

        dto.setIsActive(product.getActive());
        dto.setPriority(product.getPriority());
        dto.setShowOnHomePage(product.isShowOnHomePage());
        dto.setVariants(product.getVariants());
        return dto;
    }
}
