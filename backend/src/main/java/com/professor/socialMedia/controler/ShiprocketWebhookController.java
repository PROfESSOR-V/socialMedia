package com.professor.socialMedia.controler;

import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class ShiprocketWebhookController {

    @Value("${shiprocket.webhook.token:#{null}}")
    private String webhookToken;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/shiprocket")
    public ResponseEntity<String> handleShiprocketWebhook(
            @RequestHeader(value = "x-api-key", required = false) String token,
            @RequestBody Map<String, Object> payload) {

        // 1. Validate Token
        if (webhookToken == null || !webhookToken.equals(token)) {
            System.err.println("Unauthorized Shiprocket webhook attempt. Invalid or missing x-api-key.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            // 2. Extract AWB and Status
            String awb = null;
            if (payload.containsKey("awb")) {
                awb = String.valueOf(payload.get("awb"));
            }

            String currentStatus = null;
            if (payload.containsKey("current_status")) {
                currentStatus = String.valueOf(payload.get("current_status"));
            }

            if (awb == null || awb.isEmpty()) {
                System.out.println("Ignored Shiprocket Webhook: No AWB provided in payload.");
                return ResponseEntity.ok("Ignored");
            }

            // 3. Find order by AWB and Update
            // Note: We need a custom repository method if not exists, but we can do a
            // findAll and filter for now
            // or better yet, just write the Spring Data repository method `findByAwb`.
            // Let's assume we'll add it.
            Order order = orderRepository.findByAwb(awb).orElse(null);

            if (order != null && currentStatus != null) {
                order.setTrackingStatus(currentStatus);
                // If it reached a final state, we can map to OrderStatus too
                if (currentStatus.equalsIgnoreCase("DELIVERED")) {
                    order.setStatus(com.professor.socialMedia.entity.OrderStatus.DELIVERED);
                } else if (currentStatus.equalsIgnoreCase("RTO DELIVERED")
                        || currentStatus.equalsIgnoreCase("RTO INITIATED")) {
                    order.setStatus(com.professor.socialMedia.entity.OrderStatus.FAILED);
                }

                orderRepository.save(order);
                System.out.println(
                        "Successfully updated Order " + order.getId() + " tracking status to " + currentStatus);
            } else {
                System.out.println("Shiprocket Webhook received for unknown AWB: " + awb);
            }

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            System.err.println("Error processing Shiprocket Webhook: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }
}
