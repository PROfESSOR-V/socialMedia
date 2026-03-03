package com.professor.socialMedia.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "site_settings")
public class SiteSetting {
    @Id
    private ObjectId id;

    private String key;
    private Object value;
}
