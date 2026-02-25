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
public class ShipmozoShipmentService {

    @Value("${shipmozo.public-key}")
    private String publicKey;

    @Value("${shipmozo.private-key}")
    private String privateKey;

    @Value("${shipmozo.base-url}")
    private String baseUrl;

    public Map<String, Object> createShipment(Order order) {

        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-PUBLIC-KEY", publicKey);
        headers.set("X-PRIVATE-KEY", privateKey);

        Map<String, Object> body = new HashMap<>();
        body.put("order_id", order.getId().toHexString());
        body.put("customer_name",
                order.getShippingAddress() != null && order.getShippingAddress().getName() != null
                        ? order.getShippingAddress().getName()
                        : "Customer");
        body.put("phone",
                order.getShippingAddress() != null && order.getShippingAddress().getPhoneNumber() != null
                        ? order.getShippingAddress().getPhoneNumber()
                        : "9999999999");
        body.put("address",
                order.getShippingAddress() != null && order.getShippingAddress().getStreet() != null
                        ? order.getShippingAddress().getStreet()
                        : "Address");
        body.put("city",
                order.getShippingAddress() != null && order.getShippingAddress().getCity() != null
                        ? order.getShippingAddress().getCity()
                        : "City");
        body.put("state",
                order.getShippingAddress() != null && order.getShippingAddress().getState() != null
                        ? order.getShippingAddress().getState()
                        : "State");
        body.put("pincode",
                order.getShippingAddress() != null && order.getShippingAddress().getZip() != null
                        ? order.getShippingAddress().getZip()
                        : "000000");
        body.put("amount", order.getTotalAmount());

        body.put("items", order.getItems().stream().map(i -> {
            Map<String, Object> m = new HashMap<>();
            // Since product name isn't stored in OrderItem by default, we just pass ID or
            // logic
            m.put("name", "Product " + i.getProductId().toHexString());
            m.put("qty", i.getQuantity());
            m.put("price", i.getPriceSnapshot());
            return m;
        }).toList());

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<Map> res = rest.postForEntity(
                baseUrl + "/push-order",
                req,
                Map.class);

        return res.getBody();
    }
}
