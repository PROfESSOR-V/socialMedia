package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Blog;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BlogRepository extends MongoRepository<Blog, ObjectId> {
    List<Blog> findByPublishedTrueOrderByCreatedAtDesc();
}
