package com.professor.socialMedia.service;

import com.professor.socialMedia.dto.request.PaymentWebhookRequest;
import com.professor.socialMedia.entity.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.beans.factory.annotation.Value;
import com.professor.socialMedia.repository.CartRepository;
import com.professor.socialMedia.repository.OrderRepository;
import com.professor.socialMedia.repository.PaymentRepository;
import com.professor.socialMedia.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ShiprocketOrderService shiprocketOrderService;

    @Value("${cashfree.webhook.secret}")
    private String webhookSecret;

    public Payment createPayment(ObjectId orderId, ObjectId userId, String provider) {
        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalStateException("Order id not payable.");
        }
        Optional<Payment> existingPayment = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.CREATED);
        if (existingPayment.isPresent()) {
            Payment p = existingPayment.get();
            p.setProvider(provider);
            p.setAmount(order.getTotalAmount());
            return paymentRepository.save(p);
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
    public void handleWebhook(String payload, String signature, String timestamp) {

        // 1. Verify Cashfree signature
        if (!verifySignature(signature, payload, timestamp)) {
            throw new RuntimeException("Invalid payment signature");
        }

        try {
            // Parse Cashfree Webhook Payload
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("type").asText();

            if (!"PAYMENT_SUCCESS_WEBHOOK".equals(eventType)) {
                // Ignore other events for now or log them
                return;
            }

            JsonNode data = root.path("data");
            String reqOrderId = data.path("order").path("order_id").asText();
            String providerPaymentId = data.path("payment").path("cf_payment_id").asText();
            String reqStatus = data.path("payment").path("payment_status").asText();

            String originalOrderId = reqOrderId;
            if (reqOrderId != null && reqOrderId.contains("_")) {
                originalOrderId = reqOrderId.split("_")[0];
            }

            ObjectId orderId = new ObjectId(originalOrderId);
            boolean success = "SUCCESS".equalsIgnoreCase(reqStatus);

            // 2. Idempotency check
            Optional<Payment> existing = paymentRepository.findByProviderPaymentId(providerPaymentId);

            if (existing.isPresent()) {
                return; // already processed
            }

            // 3. Load order (THIS WAS MISSING)
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // 4. Save payment
            Payment payment = paymentRepository
                    .findByOrderIdAndStatus(orderId, PaymentStatus.CREATED)
                    .orElseThrow(() -> new RuntimeException("No pending payment found"));

            payment.setProviderPaymentId(providerPaymentId);
            payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
            Payment savedPayment = paymentRepository.save(payment);

            // 5. UPDATE ORDER (THIS IS THE MAIN BUG)
            if (success) {
                order.setStatus(OrderStatus.PAID);
                order.setPaymentId(savedPayment.getId());

                // Deduct stock safely
                for (OrderItem item : order.getItems()) {
                    Product p = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found"));
                    p.setStock(p.getStock() - item.getQuantity());
                    productRepository.save(p);
                }

                // Empty cart
                if (order.getCartId() != null) {
                    cartRepository.findById(order.getCartId()).ifPresent(cart -> {
                        cart.setItems(new ArrayList<>());
                        cartRepository.save(cart);
                    });
                }

                // Push order to Shiprocket logic
                try {
                    shiprocketOrderService.createShipment(order);
                } catch (Exception e) {
                    System.err.println("Non-blocking issue: Failed to transmit to Shiprocket: " + e.getMessage());
                }

            } else {
                order.setStatus(OrderStatus.FAILED);
                // Revert cart so the user can try again easily
                if (order.getCartId() != null) {
                    cartRepository.findById(order.getCartId()).ifPresent(cart -> {
                        cart.setStatus(CartStatus.ACTIVE);
                        cartRepository.save(cart);
                    });
                }
            }

            orderRepository.save(order);
        } catch (Exception e) {
            throw new RuntimeException("Error processing webhook payload", e);
        }
    }

    private boolean verifySignature(String signature, String payload, String timestamp) {
        try {
            String dataToVerify = (timestamp != null ? timestamp : "") + payload;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    webhookSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(dataToVerify.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String generated = java.util.Base64.getEncoder().encodeToString(hash);

            System.out.println("Webhook verification: expected=" + signature + " generated=" + generated);
            return generated.equals(signature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // private String extractPaymentId(String payload) {
    // // TEMP: parse from payload JSON
    // return "dummy_provider_payment_id";
    // }
    //
    // private ObjectId extractOrderId(String payload) {
    // // TEMP: parse from payload JSON
    // return new ObjectId();
    // }
    //
    // private boolean extractPaymentStatus(String payload) {
    // // TEMP: assume success
    // return true;
    // }

}
