package com.professor.socialMedia.service;


import com.professor.socialMedia.dto.PaymentWebhookRequest;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.OrderStatus;
import com.professor.socialMedia.entity.Payment;
import com.professor.socialMedia.entity.PaymentStatus;
import com.professor.socialMedia.repository.OrderRepository;
import com.professor.socialMedia.repository.PaymentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Payment createPayment(ObjectId orderId, String provider) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if(order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order id not payable.");
        }
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setProvider(provider);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.CREATED);
        paymentRepository.save(payment);
        return payment;
    }

    @Transactional
    public void handleWebhook(PaymentWebhookRequest req, String signature) {

        // 1. Verify signature (temporary true)
        if (!verifySignature(signature)) {
            throw new RuntimeException("Invalid payment signature");
        }

        ObjectId orderId = new ObjectId(req.getOrderId());
        String providerPaymentId = req.getPaymentId();
        boolean success = "SUCCESS".equalsIgnoreCase(req.getStatus());

        // 2. Idempotency check
        Optional<Payment> existing =
                paymentRepository.findByProviderPaymentId(providerPaymentId);

        if (existing.isPresent()) {
            return; // already processed
        }

        // 3. Load order (THIS WAS MISSING)
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 4. Save payment
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setProvider("RAZORPAY");
        payment.setProviderPaymentId(providerPaymentId);
        payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);

        Payment savedPayment = paymentRepository.save(payment);

        // 5. UPDATE ORDER (THIS IS THE MAIN BUG)
        if (success) {
            order.setStatus(OrderStatus.PAID);
            order.setPaymentId(savedPayment.getId());
        } else {
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
    }


    // TEMPORARY — replace with real gateway logic later

    private boolean verifySignature(String signature) {
        // For now, always return true
        // Later: Razorpay / Stripe signature verification
        return true;
    }

    private String extractPaymentId(String payload) {
        // TEMP: parse from payload JSON
        return "dummy_provider_payment_id";
    }

    private ObjectId extractOrderId(String payload) {
        // TEMP: parse from payload JSON
        return new ObjectId();
    }

    private boolean extractPaymentStatus(String payload) {
        // TEMP: assume success
        return true;
    }

}

