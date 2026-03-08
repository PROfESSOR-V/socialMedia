package com.professor.socialMedia.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "otp_records")
@Data
public class OtpRecord {

    @Id
    private String id;

    @Indexed(unique = true)
    private String phone;

    private String otp;

    /** When this OTP expires (2 minutes from generation) */
    private LocalDateTime expiresAt;

    /** Number of failed verification attempts for this OTP */
    private int attempts = 0;

    /** Number of OTPs sent within the current rate-limit window */
    private int otpSentCount = 0;

    /**
     * Start of the current 10-minute rate-limit window.
     * Resets when more than 10 minutes have elapsed since the first OTP in the window.
     */
    private LocalDateTime windowStart;

    /** Whether this phone has completed OTP verification (set true after successful verify) */
    private boolean verified = false;

    /** When the verified flag was set — signup must happen within 10 minutes */
    private LocalDateTime verifiedAt;
}
