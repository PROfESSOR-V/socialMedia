package com.professor.socialMedia.dto.request;

import lombok.Data;

@Data
public class RegistorRequest {
    private String mobileNumber;
    private String password;
    private String email; // optional
}
