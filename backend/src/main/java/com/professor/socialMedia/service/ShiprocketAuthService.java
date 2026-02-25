package com.professor.socialMedia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ShiprocketAuthService {

    @Value("${shiprocket.email:#{null}}")
    private String email;

    @Value("${shiprocket.password:#{null}}")
    private String password;

    private String token;
    private long expiryTime;

    public String getToken() {
        if (token == null || System.currentTimeMillis() > expiryTime) {
            login();
        }
        return token;
    }

    private synchronized void login() {
        // Double check lock to prevent multiple threads from firing auth requests
        if (token != null && System.currentTimeMillis() <= expiryTime) {
            return;
        }

        if (email == null || password == null) {
            throw new RuntimeException(
                    "Shiprocket credentials are not configured in environment variables: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD");
        }

        RestTemplate rest = new RestTemplate();
        Map<String, String> body = Map.of(
                "email", email,
                "password", password);

        ResponseEntity<Map> res = rest.postForEntity(
                "https://apiv2.shiprocket.in/v1/external/auth/login",
                body,
                Map.class);

        if (res.getBody() != null && res.getBody().containsKey("token")) {
            token = (String) res.getBody().get("token");
            // Token expires in 10 days usually, but we refresh every 8 hours safely
            expiryTime = System.currentTimeMillis() + (8 * 60 * 60 * 1000);
        } else {
            throw new RuntimeException("Failed to retrieve token from Shiprocket: " + res.getBody());
        }
    }
}
