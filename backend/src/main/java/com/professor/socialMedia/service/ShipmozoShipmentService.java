package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.professor.socialMedia.entity.Address;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.repository.ProductRepository;
import com.professor.socialMedia.repository.UserRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShipmozoShipmentService {

        @Value("${shipmozo.public-key}")
        private String publicKey;

        @Value("${shipmozo.private-key}")
        private String privateKey;

        @Value("${shipmozo.base-url}")
        private String baseUrl;

        @org.springframework.beans.factory.annotation.Autowired
        private UserRepository userRepository;

        @org.springframework.beans.factory.annotation.Autowired
        private ProductRepository productRepository;

        public Map<String, Object> createShipment(Order order) {

                RestTemplate rest = new RestTemplate();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("public-key", publicKey);
                headers.set("private-key", privateKey);

                Map<String, Object> body = new HashMap<>();
                body.put("order_id", order.getId().toHexString());

                User user = userRepository.findById(order.getUserId()).orElse(null);
                Address address = order.getShippingAddress();
                if (address == null && user != null && user.getAddresses() != null && !user.getAddresses().isEmpty()) {
                        address = user.getAddresses().get(0);
                }

                String custName = user != null && user.getName() != null ? user.getName() : "Customer";
                if (custName.trim().isEmpty())
                        custName = "Customer";

                String phone = user != null && user.getMobileNumber() != null ? user.getMobileNumber() : "9999999999";
                if (phone.trim().isEmpty())
                        phone = "9999999999";

                String addrStr = address != null && address.getStreet() != null ? address.getStreet()
                                : "No Address Provided";
                String city = address != null && address.getCity() != null ? address.getCity() : "New Delhi";
                String pin = address != null && address.getZip() != null ? address.getZip() : "110002";
                String state = address != null && address.getState() != null ? address.getState() : "Delhi";
                // Shipmozo default payload fields based on the official PDF:
                body.put("order_date", java.time.LocalDate.now().toString());
                body.put("order_type", "ESSENTIALS");
                body.put("consignee_name", custName);

                try {
                        body.put("consignee_phone", Long.parseLong(phone));
                } catch (NumberFormatException e) {
                        body.put("consignee_phone", 9999999999L);
                }

                body.put("consignee_email",
                                user != null && user.getEmail() != null ? user.getEmail() : "noemail@example.com");
                body.put("consignee_address_line_one", addrStr);
                body.put("consignee_address_line_two", "");

                try {
                        body.put("consignee_pin_code", Integer.parseInt(pin));
                } catch (NumberFormatException e) {
                        body.put("consignee_pin_code", 110002);
                }

                body.put("consignee_city", city);
                body.put("consignee_state", state);

                body.put("payment_type", "PREPAID");
                body.put("weight", 500); // weight in grams
                body.put("length", 10); // in cm
                body.put("width", 10);
                body.put("height", 10);
                body.put("warehouse_id", "102813"); // Needs to be explicitly empty if using default
                body.put("cod_amount", "");

                List<Map<String, Object>> itemsList = new ArrayList<>();
                for (var i : order.getItems()) {
                        String name = productRepository.findById(i.getProductId())
                                        .map(com.professor.socialMedia.entity.Product::getName)
                                        .orElse("Product " + i.getProductId().toHexString());

                        Map<String, Object> m = new HashMap<>();
                        m.put("name", name);
                        m.put("sku_number", i.getProductId().toHexString());
                        m.put("quantity", i.getQuantity());
                        m.put("discount", "");
                        m.put("hsn", "");
                        m.put("unit_price", i.getPriceSnapshot());
                        m.put("product_category", "Other");
                        itemsList.add(m);
                }
                body.put("product_detail", itemsList);

                HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

                ResponseEntity<Map<String, Object>> res = rest.exchange(
                                baseUrl + "/push-order",
                                org.springframework.http.HttpMethod.POST,
                                req,
                                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                                });

                return res.getBody();
        }

        public Map<String, Object> autoAssignCourier(String orderId) {
                RestTemplate rest = new RestTemplate();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("public-key", publicKey);
                headers.set("private-key", privateKey);

                Map<String, Object> body = new HashMap<>();
                body.put("order_id", orderId);

                HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

                ResponseEntity<Map<String, Object>> res = rest.exchange(
                                baseUrl + "/auto-assign-order",
                                org.springframework.http.HttpMethod.POST,
                                req,
                                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                                });

                return res.getBody();
        }

        public Map<String, Object> fetchOrderDetails(String orderId) {
                RestTemplate rest = new RestTemplate();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("public-key", publicKey);
                headers.set("private-key", privateKey);

                HttpEntity<String> req = new HttpEntity<>(headers);

                ResponseEntity<Map<String, Object>> res = rest.exchange(
                                baseUrl + "/get-order-detail/" + orderId,
                                org.springframework.http.HttpMethod.GET,
                                req,
                                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                                });

                return res.getBody();
        }
}
