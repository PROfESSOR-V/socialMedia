package com.professor.socialMedia.dto.mapper;

import com.professor.socialMedia.dto.CategoryDto;
import com.professor.socialMedia.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    public CategoryDto mapCategory(Category category){
        CategoryDto categoryDto = new CategoryDto();
        categoryDto.setId(category.getId());
        categoryDto.setName(category.getName());
        //categoryDto.setDescription(category.getDescription()); // future

        return categoryDto;
    }
}
