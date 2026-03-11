package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

@Data
@Document(collection = "test_videos")
public class TestVideo {

    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id;

    private String videoName;
    private String videoUrl;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
