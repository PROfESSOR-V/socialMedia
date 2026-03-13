package com.professor.socialMedia.controler;

import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.Payment;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.PaymentService;
import com.professor.socialMedia.service.UserService;
import com.professor.socialMedia.service.OrderService;
import com.professor.socialMedia.service.CashfreeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentControler {

        @Autowired
        private PaymentService paymentService;

        @Autowired
        private com.professor.socialMedia.repository.PaymentRepository paymentRepository;

        @Autowired
        private OrderService orderService;

        @Autowired
        private UserService userService;

        @Autowired
        private CashfreeService cashfreeService;

        @PostMapping("/order")
        public ResponseEntity<Map<String, Object>> createPayment(
                        @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails user,
                        @RequestBody Map<String, Object> request) {
                User userEntity = userService.findByMobileNumber(user.getUsername()).orElseThrow(
                                () -> new RuntimeException("User not found!"));
                Order order = orderService.findByIdAndUserId(
                                new org.bson.types.ObjectId((String) request.get("orderId")),
                                userEntity.getId());
                // 1. Create Internal Payment Tracking
                paymentService.createPayment(
                                order.getId(),
                                userEntity.getId(), // user identity
                                "CASHFREE");
                // 2. Create Cashfree Order
                Map<String, Object> cashfreeOrder = cashfreeService.createOrder(order,
                                userEntity.getEmail() != null ? userEntity.getEmail() : "noemail@example.com",
                                userEntity.getMobileNumber(), (String) request.get("returnUrl"));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(cashfreeOrder);
        }

        @PostMapping("/webhook")
        public ResponseEntity<Map<String, String>> webhook(
                        @RequestBody String payload,
                        @RequestHeader("x-webhook-signature") String signature,
                        @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {

                try {
                        paymentService.handleWebhook(payload, signature, timestamp);
                        return ResponseEntity.accepted()
                                        .body(Map.of("message", "Webhook processed successfully"));
                } catch (RuntimeException e) {
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("error", "Invalid signature: " + e.getMessage()));
                }
        }

        @PostMapping("/refund-webhook")
        public ResponseEntity<Map<String, String>> refundWebhook(
                        @RequestBody String payload,
                        @RequestHeader(value = "x-webhook-signature", required = false) String signature,
                        @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {

                try {
                        paymentService.handleRefundWebhook(payload, signature, timestamp);
                        return ResponseEntity.accepted()
                                        .body(Map.of("message", "Refund webhook processed successfully"));
                } catch (RuntimeException e) {
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("error", "Invalid signature or payload: " + e.getMessage()));
                }
        }

        /**
         * Get payment details by payment ID
         */
        // @GetMapping("/{paymentId}")
        // public ResponseEntity<ApiResponse<Payment>> getPayment(
        // @PathVariable String paymentId,
        // @AuthenticationPrincipal CustomUserDetail user) {
        //
        // try {
        // ObjectId paymentObjectId = new ObjectId(paymentId);
        // Payment payment = paymentService.getPaymentById(paymentObjectId);
        // return ResponseEntity.ok(ApiResponse.success("Payment retrieved
        // successfully", payment));
        // } catch (RuntimeException e) {
        // return ResponseEntity.status(HttpStatus.NOT_FOUND)
        // .body(ApiResponse.error("Payment not found: " + e.getMessage()));
        // }
        // }

        @GetMapping("/admin/all")
        @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Map<String, Object>> getAllPayments() {
                java.util.List<Payment> payments = paymentRepository.findAll();
                java.util.List<Map<String, Object>> result = payments.stream()
                                .sorted((p1, p2) -> {
                                        if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
                                        if (p1.getCreatedAt() == null) return 1;
                                        if (p2.getCreatedAt() == null) return -1;
                                        return p2.getCreatedAt().compareTo(p1.getCreatedAt());
                                })
                                .map(payment -> {
                                        Map<String, Object> map = new java.util.HashMap<>();
                                        map.put("id", payment.getId() != null ? payment.getId().toString() : null);
                                        map.put("orderId",
                                                        payment.getOrderId() != null ? payment.getOrderId().toString()
                                                                        : null);
                                        map.put("provider", payment.getProvider());
                                        map.put("providerPaymentId", payment.getProviderPaymentId());
                                        map.put("status", payment.getStatus());
                                        map.put("amount", payment.getAmount());
                                        map.put("createdAt", payment.getCreatedAt());

                                        if (payment.getOrderId() != null) {
                                                try {
                                                        Order order = orderService.findById(payment.getOrderId());
                                                        if (order != null && order.getUserId() != null) {
                                                                userService.findById(order.getUserId())
                                                                                .ifPresent(user -> {
                                                                                        map.put("userName", user
                                                                                                        .getName());
                                                                                        map.put("userEmail", user
                                                                                                        .getEmail());
                                                                                        map.put("userPhone", user
                                                                                                        .getMobileNumber());
                                                                                });
                                                        }
                                                } catch (Exception e) {
                                                }
                                        }
                                        return map;
                                }).collect(java.util.stream.Collectors.toList());

                return ResponseEntity.ok(Map.of("success", true, "data", result));
        }

}
