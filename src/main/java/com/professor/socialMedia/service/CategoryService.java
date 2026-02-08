package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Category;
import com.professor.socialMedia.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    public List<Category> findAll(){
        return categoryRepository.findAll();

    }
}
