package com.professor.socialMedia.dto;

import com.professor.socialMedia.entity.Address;
import com.professor.socialMedia.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String name;
    private String email;
    private Role role;
    private List<Address> addresses;
    private Instant createdAt;
}
