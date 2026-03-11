package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Coupon;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CouponRepository extends MongoRepository<Coupon, ObjectId> {
    Optional<Coupon> findByCode(String code);
}
