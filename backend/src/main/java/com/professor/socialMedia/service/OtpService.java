package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.OtpRecord;
import com.professor.socialMedia.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    /** OTP is valid for 2 minutes */
    private static final int OTP_EXPIRY_MINUTES = 2;
    /** Max wrong guesses before the OTP is locked */
    private static final int MAX_ATTEMPTS = 5;
    /** Max OTPs that may be sent within the rate-limit window */
    private static final int MAX_OTP_PER_WINDOW = 3;
    /** Duration of the rate-limit window in minutes */
    private static final int RATE_LIMIT_WINDOW_MINUTES = 10;

    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private OtpRepository otpRepository;

    // -----------------------------------------------------------------------
    // Generate & persist OTP (called by send-otp endpoint)
    // -----------------------------------------------------------------------

    /**
     * Generates a fresh 6-digit OTP, enforces rate-limiting, persists it,
     * and returns the plaintext OTP to be sent via WhatsApp.
     *
     * @param phone 10-digit mobile number (no country code)
     * @return the generated OTP string
     * @throws RuntimeException if the rate limit is exceeded
     */
    public String generateAndSave(String phone) {
        OtpRecord record = otpRepository.findByPhone(phone).orElse(null);
        LocalDateTime now = LocalDateTime.now();

        if (record == null) {
            record = new OtpRecord();
            record.setPhone(phone);
            record.setWindowStart(now);
            record.setOtpSentCount(0);
        }

        // --- Rate-limit check ---
        // Reset the window if it has expired
        if (record.getWindowStart() == null ||
                record.getWindowStart().plusMinutes(RATE_LIMIT_WINDOW_MINUTES).isBefore(now)) {
            record.setWindowStart(now);
            record.setOtpSentCount(0);
        }

        if (record.getOtpSentCount() >= MAX_OTP_PER_WINDOW) {
            LocalDateTime windowEnd = record.getWindowStart().plusMinutes(RATE_LIMIT_WINDOW_MINUTES);
            long minutesLeft = java.time.Duration.between(now, windowEnd).toMinutes() + 1;
            throw new RuntimeException("Too many OTP requests. Please wait " + minutesLeft + " minute(s) before requesting again.");
        }

        // --- Generate a cryptographically random 6-digit OTP ---
        String otp = String.format("%06d", 100000 + secureRandom.nextInt(900000));

        // --- Update / reset the record ---
        record.setOtp(otp);
        record.setExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
        record.setAttempts(0);
        record.setVerified(false);
        record.setVerifiedAt(null);
        record.setOtpSentCount(record.getOtpSentCount() + 1);

        otpRepository.save(record);
        return otp;
    }

    // -----------------------------------------------------------------------
    // Verify OTP (called by verify-otp endpoint)
    // -----------------------------------------------------------------------

    /**
     * Verifies the supplied OTP against the stored record.
     *
     * @param phone 10-digit mobile number
     * @param otp   6-digit OTP entered by the user
     * @throws RuntimeException with a user-friendly message on failure
     */
    public void verifyOtp(String phone, String otp) {
        OtpRecord record = otpRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("No OTP found for this number. Please request a new OTP."));

        if (record.getAttempts() >= MAX_ATTEMPTS) {
            throw new RuntimeException("Too many failed attempts. Please request a new OTP.");
        }

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!record.getOtp().equals(otp)) {
            record.setAttempts(record.getAttempts() + 1);
            otpRepository.save(record);
            int remaining = MAX_ATTEMPTS - record.getAttempts();
            throw new RuntimeException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // OTP is correct — mark as verified
        record.setVerified(true);
        record.setVerifiedAt(LocalDateTime.now());
        // Clear the plaintext OTP so it cannot be replayed
        record.setOtp(null);
        otpRepository.save(record);
    }

    // -----------------------------------------------------------------------
    // Check verified status (called by signup endpoint)
    // -----------------------------------------------------------------------

    /**
     * Returns true if the phone number's OTP has been verified within the last
     * 10 minutes. This guard prevents signup without a prior OTP verification.
     */
    public boolean isPhoneVerified(String phone) {
        return otpRepository.findByPhone(phone)
                .map(record -> {
                    if (!record.isVerified() || record.getVerifiedAt() == null) {
                        return false;
                    }
                    // Verification must have happened within the last 10 minutes
                    return record.getVerifiedAt()
                            .plusMinutes(10)
                            .isAfter(LocalDateTime.now());
                })
                .orElse(false);
    }

    /**
     * Cleans up the OTP record after a successful signup so it cannot be reused.
     */
    public void deleteRecord(String phone) {
        otpRepository.findByPhone(phone).ifPresent(otpRepository::delete);
    }
}
