package com.professor.socialMedia.entity;

import java.time.Instant;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NonNull;

@Document(collection = "users")
@Data
public class User {

    @Id
    private ObjectId id;

    private String name;
    @NonNull
    @Indexed(unique = true)
    private String email;
    @NonNull
    private String password;

    private Role role = Role.CUSTOMER;

    private String mobileNumber;

    private List<Address> addresses;

    private Instant createdAt = Instant.now();
}
