package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Category;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CategoryRepository extends MongoRepository<Category, ObjectId> {
    List<Category> findAllByOrderByPriorityDesc();
}
