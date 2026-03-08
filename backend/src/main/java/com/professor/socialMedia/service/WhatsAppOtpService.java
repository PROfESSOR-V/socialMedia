package com.professor.socialMedia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WhatsAppOtpService {

    @Value("${msg91.auth-key}")
    private String authKey;

    @Value("${msg91.integrated-number}")
    private String integratedNumber;

    private static final String MSG91_URL =
            "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends a 6-digit OTP to the given phone number via MSG91 WhatsApp.
     *
     * @param phone 10-digit mobile number (country code "91" is prepended automatically)
     * @param otp   6-digit OTP to include in the message
     */
    public void sendOtp(String phone, String otp) {
        String recipientNumber = "91" + phone;

        // Construct the exact MSG91 JSON payload for the authorization template
        String payloadJson = String.format("""
            {
                "integrated_number": "%s",
                "content_type": "template",
                "payload": {
                    "messaging_product": "whatsapp",
                    "type": "template",
                    "template": {
                        "name": "auth_sms_template",
                        "language": {
                            "code": "en",
                            "policy": "deterministic"
                        },
                        "namespace": "077a116d_3f34_4324_bac7_afeebdd17cd3",
                        "to_and_components": [
                            {
                                "to": [
                                    "%s"
                                ],
                                "components": {
                                    "body_1": {
                                        "type": "text",
                                        "value": "%s"
                                    },
                                    "button_1": {
                                        "subtype": "url",
                                        "type": "text",
                                        "value": "%s"
                                    }
                                }
                            }
                        ]
                    }
                }
            }""", integratedNumber, recipientNumber, otp, otp); // Pass OTP twice, once for body body_1 and once for button_1 URL param

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("accept", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(payloadJson, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    MSG91_URL, HttpMethod.POST, entity, String.class);

            String responseBody = response.getBody();
            System.out.println("MSG91 API Response: " + responseBody);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("MSG91 API returned status: " + response.getStatusCode());
            }
            
            if (responseBody != null && (responseBody.contains("\"type\":\"error\"") || responseBody.contains("\"hasError\":true") || responseBody.contains("\"type\": \"error\""))) {
                System.err.println("MSG91 API Error parsed from successful response: " + responseBody);
                throw new RuntimeException("MSG91 rejected the request: " + responseBody);
            }
        } catch (RuntimeException ex) {
             throw ex; // Re-throw the parsed runtime exception
        } catch (Exception ex) {
            // Wrap with a user-friendly message so the controller can return a clean error
            throw new RuntimeException("Failed to send WhatsApp OTP. Please try again later.", ex);
        }
    }
}
