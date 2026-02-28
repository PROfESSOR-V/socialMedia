package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Address;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.OrderItem;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.repository.ProductRepository;
import com.professor.socialMedia.repository.UserRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ShipmozoShipmentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    // Use InjectMocks but we'll need to use ReflectionTestUtils for the
    // RestTemplate if we really wanted to mock it.
    // For now, testing the parameter construction logic via partial mocking or
    // asserting exceptions is fine,
    // but the actual RestTemplate call is hardcoded inside the method body.
    // To properly unit test without hitting real network, we either refactor
    // ShipmozoShipmentService to take RestTemplate via constructor
    // OR we test the logic up to the request. Since it's tightly coupled, we will
    // simulate the order assembly to ensure it doesn't throw null pointers.

    @InjectMocks
    private ShipmozoShipmentService shipmozoShipmentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(shipmozoShipmentService, "publicKey", "test-public-key");
        ReflectionTestUtils.setField(shipmozoShipmentService, "privateKey", "test-private-key");
        ReflectionTestUtils.setField(shipmozoShipmentService, "baseUrl", "http://localhost:8080/mock-shipmozo");
    }

    @Test
    void testCreateShipmentUserNotFoundHandling() {
        // Prepare dummy order
        Order order = new Order();
        order.setId(new ObjectId());
        order.setUserId(new ObjectId());

        // Order Item
        OrderItem item = new OrderItem();
        item.setProductId(new ObjectId());
        item.setQuantity(1);
        item.setPriceSnapshot(100.0);
        List<OrderItem> items = new ArrayList<>();
        items.add(item);
        order.setItems(items);

        // Address
        Address address = new Address();
        address.setStreet("123 Mock St");
        address.setCity("Mock City");
        address.setZip("12345");
        address.setState("Mock State");
        order.setShippingAddress(address);

        when(userRepository.findById(any())).thenReturn(Optional.empty());
        when(productRepository.findById(any())).thenReturn(Optional.empty());

        // Exception expected because RestTemplate tries to hit
        // localhost:8080/mock-shipmozo which is down.
        // But we are validating that the mapping logic before the network call doesn't
        // throw NullPointerExceptions when User is missing.
        try {
            shipmozoShipmentService.createShipment(order);
        } catch (org.springframework.web.client.ResourceAccessException e) {
            // Success, it reached the network logic safely!
            assertNotNull(e.getMessage());
        }
    }
}
