package com.professor.socialMedia.service;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.config.Configuration;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

@Service
public class ImageKitService {

    @Value("${imagekit.public-key}")
    private String publicKey;

    @Value("${imagekit.private-key}")
    private String privateKey;

    @Value("${imagekit.url-endpoint}")
    private String urlEndpoint;

    @PostConstruct
    public void init() {
        ImageKit imageKit = ImageKit.getInstance();
        Configuration config = new Configuration(publicKey, privateKey, urlEndpoint);
        imageKit.setConfig(config);
    }

    public String uploadImage(MultipartFile file) throws IOException {
        String base64Image = java.util.Base64.getEncoder().encodeToString(file.getBytes());

        FileCreateRequest fileCreateRequest = new FileCreateRequest(base64Image, file.getOriginalFilename());
        fileCreateRequest.setFolder("/blogs");
        
        try {
            Result result = ImageKit.getInstance().upload(fileCreateRequest);
            return result.getUrl();
        } catch (Exception e) {
            throw new IOException("Failed to upload image to ImageKit", e);
        }
    }
}
