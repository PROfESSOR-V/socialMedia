package com.professor.socialMedia.dto.request;

import lombok.Data;

@Data
public class SendOtpRequest {
    /** 10-digit mobile number, no country code */
    private String phone;
}
