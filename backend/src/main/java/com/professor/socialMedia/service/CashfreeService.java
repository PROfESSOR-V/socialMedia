package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class CashfreeService {

        private final RestTemplate restTemplate = new RestTemplate();

        @Value("${cashfree.client-id}")
        private String clientId;

        @Value("${cashfree.client-secret}")
        private String clientSecret;

        @Value("${cashfree.base-url}")
        private String baseUrl;

        public Map<String, Object> createOrder(Order order, String customerEmail, String customerPhone,
                        String returnUrl, double amount) {

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-client-id", clientId);
                headers.set("x-client-secret", clientSecret);
                headers.set("x-api-version", "2023-08-01");

                Map<String, Object> body = new HashMap<>();
                String cashfreeOrderId = order.getId().toString() + "_" + System.currentTimeMillis();
                body.put("order_id", cashfreeOrderId);
                body.put("order_amount", amount);
                body.put("order_currency", "INR");
                body.put("customer_details", Map.of(
                                "customer_id", order.getUserId().toString(),
                                "customer_email", customerEmail,
                                "customer_phone",
                                customerPhone != null && !customerPhone.isEmpty() ? customerPhone : "9999999999"));

                Map<String, Object> orderMeta = new HashMap<>();
                orderMeta.put("notify_url", "https://api.aurelynbeauty.com/api/payments/webhook");
                if (returnUrl != null && !returnUrl.isEmpty()) {
                        orderMeta.put("return_url", returnUrl + "?order_id=" + order.getId().toString());
                }
                body.put("order_meta", orderMeta);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                System.out.println("Making Request to: " + baseUrl + "/orders");

                ResponseEntity<Map> response = restTemplate.postForEntity(
                                baseUrl + "/orders", request, Map.class);

                return response.getBody();
        }

        public java.util.List<Map<String, Object>> getRefundsForOrder(String orderId) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-client-id", clientId);
                headers.set("x-client-secret", clientSecret);
                headers.set("x-api-version", "2023-08-01");

                HttpEntity<Void> request = new HttpEntity<>(headers);

                try {
                        ResponseEntity<java.util.List> response = restTemplate.exchange(
                                        baseUrl + "/orders/" + orderId + "/refunds",
                                        org.springframework.http.HttpMethod.GET,
                                        request,
                                        java.util.List.class);
                        return (java.util.List<Map<String, Object>>) response.getBody();
                } catch (Exception e) {
                        System.err.println("Failed to get refunds for order " + orderId + ": " + e.getMessage());
                        return null;
                }
        }

        public Map<String, Object> getPaymentDetails(String cfPaymentId) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-client-id", clientId);
                headers.set("x-client-secret", clientSecret);
                headers.set("x-api-version", "2023-08-01");

                HttpEntity<Void> request = new HttpEntity<>(headers);

                try {
                        ResponseEntity<Map> response = restTemplate.exchange(
                                        baseUrl + "/payments/" + cfPaymentId,
                                        org.springframework.http.HttpMethod.GET,
                                        request,
                                        Map.class);
                        return response.getBody();
                } catch (Exception e) {
                        System.err.println("Failed to get payment details for " + cfPaymentId + ": " + e.getMessage());
                        return null;
                }
        }
}
