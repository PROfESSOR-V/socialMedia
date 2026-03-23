package com.professor.socialMedia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@Service
public class ImageKitService {

    @Value("${imagekit.private-key}")
    private String privateKey;

    @Value("${imagekit.url-endpoint}")
    private String urlEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

    public String uploadImage(MultipartFile file) throws IOException {
        // Prepare multipart form data
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Add file as ByteArrayResource so RestTemplate can send it
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", fileResource);
        body.add("fileName", file.getOriginalFilename());
        body.add("folder", "/blogs");

        // Set headers with Basic Auth (private key as username, no password)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        String auth = Base64.getEncoder().encodeToString((privateKey + ":").getBytes());
        headers.set("Authorization", "Basic " + auth);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    IMAGEKIT_UPLOAD_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("url")) {
                return (String) responseBody.get("url");
            }
            throw new IOException("ImageKit response did not contain a URL");
        } catch (Exception e) {
            throw new IOException("Failed to upload image to ImageKit: " + e.getMessage(), e);
        }
    }
}
