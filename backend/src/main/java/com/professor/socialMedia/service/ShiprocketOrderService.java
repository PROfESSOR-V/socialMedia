package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Address;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.OrderItem;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.repository.ProductRepository;
import com.professor.socialMedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShiprocketOrderService {

    @Autowired
    private ShiprocketAuthService authService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public void createShipment(Order order) {
        try {
            RestTemplate rest = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(authService.getToken());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("order_id", order.getId().toString());
            body.put("order_date", order.getCreatedAt().toString());

            User user = userRepository.findById(order.getUserId()).orElse(null);
            Address address = order.getShippingAddress();
            if (address == null && user != null && user.getAddresses() != null && !user.getAddresses().isEmpty()) {
                address = user.getAddresses().get(0);
            }

            String custName = user != null && user.getName() != null ? user.getName() : "Customer";
            if (custName.trim().isEmpty())
                custName = "Customer";

            String email = user != null && user.getEmail() != null ? user.getEmail() : "test@example.com";
            if (email.trim().isEmpty())
                email = "test@example.com";

            String phone = user != null && user.getMobileNumber() != null ? user.getMobileNumber() : "9999999999";
            if (phone.trim().isEmpty())
                phone = "9999999999";

            String addrStr = address != null && address.getStreet() != null ? address.getStreet()
                    : "No Address Provided";
            String city = address != null && address.getCity() != null ? address.getCity() : "New Delhi";
            String pin = address != null && address.getZip() != null ? address.getZip() : "110002";
            String state = address != null && address.getState() != null ? address.getState() : "Delhi";
            String country = address != null && address.getCountry() != null ? address.getCountry() : "India";

            body.put("billing_customer_name", custName);
            body.put("billing_last_name", "");
            body.put("billing_address", addrStr);
            body.put("billing_city", city);
            body.put("billing_pincode", pin);
            body.put("billing_state", state);
            body.put("billing_country", country);
            body.put("billing_email", email);
            body.put("billing_phone", phone);
            body.put("shipping_is_billing", true);

            // Map the items
            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                String name = productRepository.findById(item.getProductId())
                        .map(com.professor.socialMedia.entity.Product::getName)
                        .orElse("Unknown Product");

                itemsList.add(Map.of(
                        "name", name,
                        "sku", item.getProductId().toString(),
                        "units", item.getQuantity(),
                        "selling_price", item.getPriceSnapshot()));
            }
            body.put("order_items", itemsList);
            body.put("payment_method", "Prepaid");
            body.put("sub_total", order.getTotalAmount());
            body.put("length", 10);
            body.put("breadth", 15);
            body.put("height", 20);
            body.put("weight", 0.5);

            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

            ResponseEntity<Map> res = rest.postForEntity(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    req,
                    Map.class);

            if (res.getBody() != null) {
                // Parse out the fields for tracking
                if (res.getBody().containsKey("shipment_id")) {
                    order.setShipmentId(String.valueOf(res.getBody().get("shipment_id")));
                }
                if (res.getBody().containsKey("awb_code")) {
                    order.setAwb((String) res.getBody().get("awb_code"));
                }
                if (res.getBody().containsKey("courier_name")) {
                    order.setCourier((String) res.getBody().get("courier_name"));
                }
                order.setTrackingStatus("Pickup Pending"); // Initial status
            }

        } catch (Exception e) {
            System.err
                    .println("Failed to create Shiprocket Shipment for Order " + order.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
