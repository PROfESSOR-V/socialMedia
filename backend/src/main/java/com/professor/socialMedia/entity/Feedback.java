package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "feedback")
@Data
public class Feedback {
    @Id
    private ObjectId id;

    private ObjectId userId;
    private String name;
    private String topic;
    private Integer rating;
    private String message;

    private Instant createdAt = Instant.now();
}
