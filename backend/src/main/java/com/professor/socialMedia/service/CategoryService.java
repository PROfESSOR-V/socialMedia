package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Category;
import com.professor.socialMedia.repository.CategoryRepository;
import org.bson.types.ObjectId;
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
    public Category findById(String id) {
        try {
            return categoryRepository.findById(new org.bson.types.ObjectId(id)).orElse(null);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public Category update(Category category) {
        return categoryRepository.save(category);
    }

    public void delete(String id) {
        try {
            categoryRepository.deleteById(new org.bson.types.ObjectId(id));
        } catch (IllegalArgumentException e) {
            // ignore or log
        }
    }
}
