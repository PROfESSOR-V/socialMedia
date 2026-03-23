package com.professor.socialMedia.controler;

import com.professor.socialMedia.service.CloudinaryService;
import com.professor.socialMedia.service.ImageKitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadControler {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ImageKitService imageKitService;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image to Cloudinary"));
        }
    }

    @PostMapping("/imagekit")
    public ResponseEntity<Map<String, String>> uploadImageToImageKit(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageKitService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image to ImageKit"));
        }
    }
}
