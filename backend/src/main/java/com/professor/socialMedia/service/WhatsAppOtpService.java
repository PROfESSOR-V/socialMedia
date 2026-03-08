package com.professor.socialMedia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class WhatsAppOtpService {

    @Value("${msg91.auth-key}")
    private String authKey;

    @Value("${msg91.integrated-number}")
    private String integratedNumber;

    private static final String MSG91_URL =
            "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends a 6-digit OTP to the given phone number via MSG91 WhatsApp.
     *
     * @param phone 10-digit mobile number (country code "91" is prepended automatically)
     * @param otp   6-digit OTP to include in the message
     */
    public void sendOtp(String phone, String otp) {
        String recipientNumber = "91" + phone;
        String message = "Your AÚRELYÑ verification code is *" + otp +
                "*. It is valid for 2 minutes. Do not share this with anyone.";

        String url = UriComponentsBuilder.fromUri(java.net.URI.create(MSG91_URL))
                .queryParam("integrated_number", integratedNumber)
                .queryParam("recipient_number", recipientNumber)
                .queryParam("content_type", "text")
                .queryParam("text", message)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("accept", "application/json");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("MSG91 API returned status: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            // Wrap with a user-friendly message so the controller can return a clean error
            throw new RuntimeException("Failed to send WhatsApp OTP. Please try again later.", ex);
        }
    }
}
