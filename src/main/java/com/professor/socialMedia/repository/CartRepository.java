package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Cart;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, ObjectId> {

    Optional<Cart> findByUserId(ObjectId id);
}
