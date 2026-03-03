package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Feedback;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.repository.FeedbackRepository;
import com.professor.socialMedia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> submitFeedback(
            @AuthenticationPrincipal CustomUserDetail user,
            @RequestBody Map<String, String> body) {

        try {
            String message = body.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponse.error("Feedback message cannot be empty"));
            }

            String[] words = message.trim().split("\\s+");
            if (words.length > 100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponse.error("Feedback message cannot exceed 100 words"));
            }

            Feedback feedback = new Feedback();
            feedback.setMessage(message);

            if (body.get("name") != null && !body.get("name").trim().isEmpty()) {
                feedback.setName(body.get("name").trim());
            }

            if (user != null) {
                userService.findByMobileNumber(user.getUsername()).ifPresent(userEntity -> {
                    feedback.setUserId(userEntity.getId());
                    if (feedback.getName() == null) {
                        feedback.setName(userEntity.getName());
                    }
                });
            }

            feedbackRepository.save(feedback);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("Feedback submitted successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to submit feedback: " + e.getMessage()));
        }
    }
}
