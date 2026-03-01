package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, ObjectId> {
    User findByMobileNumber(String mobileNumber);

    User findByEmail(String email);
}
