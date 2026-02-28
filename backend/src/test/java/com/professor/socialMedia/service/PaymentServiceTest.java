package com.professor.socialMedia.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.professor.socialMedia.repository.CartRepository;
import com.professor.socialMedia.repository.OrderRepository;
import com.professor.socialMedia.repository.PaymentRepository;
import com.professor.socialMedia.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ShipmozoShipmentService shipmozoShipmentService;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "test-secret");
        ReflectionTestUtils.setField(paymentService, "objectMapper", objectMapper);
    }

    @Test
    void testHandleWebhook_InvalidSignatureThrowsException() {
        // Arrange
        String payload = "{\"type\":\"PAYMENT_SUCCESS_WEBHOOK\",\"data\":{}}";
        String invalidSignature = "invalid-sig";
        String timestamp = "123456789";

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.handleWebhook(payload, invalidSignature, timestamp);
        });

        assertEquals("Error processing webhook payload", exception.getMessage());
        assertEquals("Invalid payment signature", exception.getCause().getMessage());
    }

    @Test
    void testHandleWebhook_ValidSignature_IgnoresUnknownEvents() {
        // Arrange
        String payload = "{\"type\":\"UNKNOWN_EVENT\",\"data\":{}}";
        String timestamp = "123456789";

        // Calculate valid signature
        String validSignature = calculateSignature("test-secret", timestamp + payload);

        // Act
        // This should run successfully and return early without hitting DB queries
        // since event type is ignored
        paymentService.handleWebhook(payload, validSignature, timestamp);

        // Assert
        // No exceptions thrown
    }

    private String calculateSignature(String secret, String dataToVerify) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(dataToVerify.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return null;
        }
    }
}
