package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.request.CreatePaymentRequest;
import com.professor.socialMedia.dto.request.PaymentWebhookRequest;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.Payment;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.OrderService;
import com.professor.socialMedia.service.PaymentService;
import com.professor.socialMedia.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentControler {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PostMapping("/order")
    public ResponseEntity<ApiResponse<Payment>> createPayment(
            @AuthenticationPrincipal CustomUserDetail user,
            @RequestBody CreatePaymentRequest request
    ) {
        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Payment payment = paymentService.createPayment(
                new ObjectId(request.getOrderId()),
                userEntity.getId(),   // user identity
                request.getProvider()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", payment));
    }



    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> webhook(
            @RequestBody PaymentWebhookRequest request,
            @RequestHeader("X-Signature") String signature) {

        try {
            paymentService.handleWebhook(request, signature);
            return ResponseEntity.accepted()
                    .body(ApiResponse.success("Webhook processed successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid signature: " + e.getMessage()));
        }
    }
    /**
     * Get payment details by payment ID
     */
//    @GetMapping("/{paymentId}")
//    public ResponseEntity<ApiResponse<Payment>> getPayment(
//            @PathVariable String paymentId,
//            @AuthenticationPrincipal CustomUserDetail user) {
//
//        try {
//            ObjectId paymentObjectId = new ObjectId(paymentId);
//            Payment payment = paymentService.getPaymentById(paymentObjectId);
//            return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(ApiResponse.error("Payment not found: " + e.getMessage()));
//        }
//    }

}
