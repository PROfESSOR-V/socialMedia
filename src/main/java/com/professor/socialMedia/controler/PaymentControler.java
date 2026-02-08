package com.professor.socialMedia.controler;

import com.professor.socialMedia.dto.PaymentWebhookRequest;
import com.professor.socialMedia.entity.Payment;
import com.professor.socialMedia.service.OrderService;
import com.professor.socialMedia.service.PaymentService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentControler {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/order/{orderId}")
    public ResponseEntity<Payment> createPayment(@PathVariable ObjectId orderId, @RequestBody String provider){
        Payment payment = paymentService.createPayment(orderId, provider);
        return new ResponseEntity<>(payment, HttpStatus.CREATED);

    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody PaymentWebhookRequest request,
            @RequestHeader("X-Signature") String signature
    ) {
        paymentService.handleWebhook(request, signature);
        return ResponseEntity.accepted().build();
    }



}
