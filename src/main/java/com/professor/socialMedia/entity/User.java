package com.professor.socialMedia.entity;

import lombok.Data;
import lombok.NonNull;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;


@Document(collection = "users")
@Data
public class User {

    @Id
    private ObjectId id;
//    @Indexed(unique = true)
//    @NonNull
//    private String userName;
    @NonNull
    @Indexed(unique = true)
    private String email;
    @NonNull
    private String password;

    private Role role = Role.CUSTOMER;

    private List<Address> addresses;

    private Instant  createdAt =  Instant.now();
}
