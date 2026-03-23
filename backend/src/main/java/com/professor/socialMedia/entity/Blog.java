package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

@Document(collection = "blogs")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Blog {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id;
    private String title;
    private String content; // Rich text HTML content
    private String author;
    private String imageUrl; // Cover image for the blog card/header
    private String slug; // URL-friendly string for routing
    private boolean published = true;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
