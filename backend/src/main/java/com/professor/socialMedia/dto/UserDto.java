package com.professor.socialMedia.dto;

import java.time.Instant;
import java.util.List;

import com.professor.socialMedia.entity.Address;
import com.professor.socialMedia.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String mobileNumber;
    private Role role;
    private List<Address> addresses;
    private Instant createdAt;
}
