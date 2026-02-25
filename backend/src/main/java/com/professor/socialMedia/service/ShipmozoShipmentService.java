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
                headers.set("X-PUBLIC-KEY", publicKey);
                headers.set("X-PRIVATE-KEY", privateKey);

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
                // Shipmozo default payload fields based on phase 3 instructions:
                body.put("customer_name", custName);
                body.put("phone", phone);
                body.put("address", addrStr);
                body.put("city", city);
                body.put("state", state);
                body.put("pincode", pin);
                body.put("amount", order.getTotalAmount());

                List<Map<String, Object>> itemsList = new ArrayList<>();
                for (var i : order.getItems()) {
                        String name = productRepository.findById(i.getProductId())
                                        .map(com.professor.socialMedia.entity.Product::getName)
                                        .orElse("Product " + i.getProductId().toHexString());

                        Map<String, Object> m = new HashMap<>();
                        m.put("name", name);
                        m.put("qty", i.getQuantity());
                        m.put("price", i.getPriceSnapshot());
                        itemsList.add(m);
                }
                body.put("items", itemsList);

                HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

                ResponseEntity<Map> res = rest.postForEntity(
                                baseUrl + "/push-order",
                                req,
                                Map.class);

                return res.getBody();
        }
}
