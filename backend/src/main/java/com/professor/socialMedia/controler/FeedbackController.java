package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Feedback;
import com.professor.socialMedia.repository.FeedbackRepository;
import com.professor.socialMedia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
            @RequestBody Map<String, Object> body) {

        try {
            String message = (String) body.get("message");
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

            if (body.get("name") != null && !((String) body.get("name")).trim().isEmpty()) {
                feedback.setName(((String) body.get("name")).trim());
            }

            if (body.get("topic") != null && !((String) body.get("topic")).trim().isEmpty()) {
                feedback.setTopic(((String) body.get("topic")).trim());
            }

            if (body.get("rating") != null) {
                if (body.get("rating") instanceof Integer) {
                    feedback.setRating((Integer) body.get("rating"));
                } else if (body.get("rating") instanceof String) {
                    feedback.setRating(Integer.parseInt((String) body.get("rating")));
                }
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
                    ApiResponse.success("Feedback submitted successfully", feedback));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to submit feedback: " + e.getMessage()));
        }
    }

    @GetMapping("/topic/{topic}")
    public ResponseEntity<?> getFeedbackByTopic(@PathVariable String topic) {
        try {
            List<Feedback> feedbackList = feedbackRepository.findByTopicOrderByCreatedAtDesc(topic);
            return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", feedbackList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to fetch feedback: " + e.getMessage()));
        }
    }

    @GetMapping("/stats/{topic}")
    public ResponseEntity<?> getStatsByTopic(@PathVariable String topic) {
        try {
            List<Feedback> feedbackList = feedbackRepository.findByTopicOrderByCreatedAtDesc(topic);
            long totalReviews = feedbackList.size();
            double averageRating = 0.0;
            if (totalReviews > 0) {
                double sum = feedbackList.stream()
                        .filter(f -> f.getRating() != null)
                        .mapToInt(Feedback::getRating)
                        .sum();
                long countWithRating = feedbackList.stream()
                        .filter(f -> f.getRating() != null)
                        .count();
                if (countWithRating > 0) {
                    averageRating = sum / countWithRating;
                }
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReviews", totalReviews);
            stats.put("averageRating", String.format("%.1f", averageRating));

            return ResponseEntity.ok(ApiResponse.success("Stats retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to fetch stats: " + e.getMessage()));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentFeedback() {
        try {
            // Fetch top 20 positive feedback (4 or 5 stars)
            List<Feedback> feedbackList = feedbackRepository.findTop20ByRatingGreaterThanEqualOrderByCreatedAtDesc(4);
            return ResponseEntity.ok(ApiResponse.success("Recent feedback retrieved successfully", feedbackList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to fetch recent feedback: " + e.getMessage()));
        }
    }
}
