package com.professor.socialMedia.controler;

import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.TestVideo;
import com.professor.socialMedia.service.TestVideoService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/testvideos")
public class TestVideoControler {

    @Autowired
    private TestVideoService testVideoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestVideo>>> getAllVideos() {
        List<TestVideo> videos = testVideoService.getAllVideos();
        return ResponseEntity.ok(ApiResponse.success("Videos retrieved successfully", videos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TestVideo>> uploadVideo(
            @RequestParam("videoName") String videoName,
            @RequestParam("file") MultipartFile file) {
        try {
            TestVideo savedVideo = testVideoService.uploadVideo(videoName, file);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Video uploaded successfully", savedVideo));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload video to Cloudinary"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(@PathVariable String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            testVideoService.deleteVideo(objectId);
            return ResponseEntity.ok(ApiResponse.success("Video deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete video"));
        }
    }
}
