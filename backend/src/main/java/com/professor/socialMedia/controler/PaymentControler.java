package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.request.CreatePaymentRequest;
import com.professor.socialMedia.dto.request.PaymentWebhookRequest;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.Payment;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.CashfreeService;
import com.professor.socialMedia.service.OrderService;
import com.professor.socialMedia.service.PaymentService;
import com.professor.socialMedia.service.UserService;
import org.bson.types.ObjectId;
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
        private OrderService orderService;

        @Autowired
        private UserService userService;

        @Autowired
        private CashfreeService cashfreeService;

        @PostMapping("/order")
        public ResponseEntity<ApiResponse<Map<String, Object>>> createPayment(
                        @AuthenticationPrincipal CustomUserDetail user,
                        @RequestBody CreatePaymentRequest request) {
                User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                                () -> new RuntimeException("User not found!"));
                Order order = orderService.findByIdAndUserId(
                                new ObjectId(request.getOrderId()),
                                userEntity.getId());
                // 1. Create Internal Payment Tracking
                paymentService.createPayment(
                                order.getId(),
                                userEntity.getId(), // user identity
                                "CASHFREE");
                // 2. Create Cashfree Order
                Map<String, Object> cashfreeOrder = cashfreeService.createOrder(order, userEntity.getEmail(),
                                userEntity.getMobileNumber(), request.getReturnUrl());

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Payment order created successfully", cashfreeOrder));
        }

        @PostMapping("/webhook")
        public ResponseEntity<ApiResponse<Void>> webhook(
                        @RequestBody String payload,
                        @RequestHeader("x-webhook-signature") String signature,
                        @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {

                try {
                        paymentService.handleWebhook(payload, signature, timestamp);
                        return ResponseEntity.accepted()
                                        .body(ApiResponse.success("Webhook processed successfully", null));
                } catch (RuntimeException e) {
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(ApiResponse.error("Invalid signature: " + e.getMessage()));
                }
        }

        @PostMapping("/refund-webhook")
        public ResponseEntity<ApiResponse<Void>> refundWebhook(
                        @RequestBody String payload,
                        @RequestHeader(value = "x-webhook-signature", required = false) String signature,
                        @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {

                try {
                        paymentService.handleRefundWebhook(payload, signature, timestamp);
                        return ResponseEntity.accepted()
                                        .body(ApiResponse.success("Refund webhook processed successfully", null));
                } catch (RuntimeException e) {
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(ApiResponse.error("Invalid signature or payload: " + e.getMessage()));
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

}
