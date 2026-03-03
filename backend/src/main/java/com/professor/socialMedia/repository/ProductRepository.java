package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Product;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, ObjectId> {

    List<Product> findByActiveTrueOrderByPriorityDesc();

    List<Product> findAllByOrderByPriorityDesc();

    List<Product> findByCategoryId(ObjectId categoryId);
}
