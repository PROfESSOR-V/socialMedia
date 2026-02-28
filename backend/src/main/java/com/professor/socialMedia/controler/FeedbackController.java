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
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        ApiResponse.error("You must be logged in to submit feedback"));
            }

            User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                    () -> new RuntimeException("User not found!"));

            String message = body.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponse.error("Feedback message cannot be empty"));
            }

            Feedback feedback = new Feedback();
            feedback.setUserId(userEntity.getId());
            feedback.setMessage(message);

            feedbackRepository.save(feedback);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("Feedback submitted successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to submit feedback: " + e.getMessage()));
        }
    }
}
