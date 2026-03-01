package com.professor.socialMedia.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String mobileNumber;
    private String password;
}
