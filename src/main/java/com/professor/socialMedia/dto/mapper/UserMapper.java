package com.professor.socialMedia.dto.mapper;

import com.professor.socialMedia.dto.UserDto;
import com.professor.socialMedia.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDto mapUser(User user){
        UserDto dto = new UserDto();
        dto.setId(user.getId().toString());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAddresses(user.getAddresses());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
