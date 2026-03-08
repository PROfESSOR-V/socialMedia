package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.TestVideo;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestVideoRepository extends MongoRepository<TestVideo, ObjectId> {
}
