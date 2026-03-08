package com.professor.socialMedia.dto.request;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    /** 10-digit mobile number, no country code */
    private String phone;
    /** The 6-digit OTP entered by the user */
    private String otp;
}
