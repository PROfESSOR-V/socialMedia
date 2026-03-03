package com.professor.socialMedia.controler;

import com.professor.socialMedia.dto.CategoryDto;
import com.professor.socialMedia.dto.mapper.CategoryMapper;
import com.professor.socialMedia.dto.request.CreateCategoryRequest;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Category;
import com.professor.socialMedia.service.CategoryService;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryControler {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryMapper categoryMapper;

    /**
     * Get all categories - PUBLIC endpoint
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        List<CategoryDto> categoryDtos = categories.stream()
                .map(categoryMapper::mapCategory)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categoryDtos));
    }

    /**
     * Create new category - ADMIN only
     */

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CreateCategoryRequest req) {
        Category category = new Category();
        category.setName(req.getName());
        if (req.getPriority() != null) {
            category.setPriority(req.getPriority());
        }

        Category created = categoryService.create(category);
        CategoryDto categoryDto = categoryMapper.mapCategory(created);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Category created successfully", categoryDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CreateCategoryRequest req) {

        Category category = categoryService.findById(id);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Category not found"));
        }

        category.setName(req.getName());
        if (req.getPriority() != null) {
            category.setPriority(req.getPriority());
        }
        Category updated = categoryService.update(category);
        CategoryDto categoryDto = categoryMapper.mapCategory(updated);

        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", categoryDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        Category category = categoryService.findById(id);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Category not found"));
        }

        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
