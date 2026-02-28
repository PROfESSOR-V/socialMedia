package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Feedback;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, ObjectId> {
    List<Feedback> findByUserId(ObjectId userId);
}
