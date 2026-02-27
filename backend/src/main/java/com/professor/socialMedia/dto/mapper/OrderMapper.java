package com.professor.socialMedia.dto.mapper;

import com.professor.socialMedia.dto.OrderDto;
import com.professor.socialMedia.dto.OrderItemDto;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.repository.ProductRepository;
import com.professor.socialMedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public OrderDto mapOrder(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId().toString());
        orderDto.setUserId(order.getUserId().toString());
        orderDto.setItems(order.getItems().stream().map(item -> {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setProductId(item.getProductId().toString());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPriceSnapshot());
            itemDto.setVariantName(item.getVariantName());

            productRepository.findById(item.getProductId()).ifPresent(product -> {
                itemDto.setProductName(product.getName());
            });

            return itemDto;
        }).collect(Collectors.toList()));

        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setStatus(order.getStatus());
        orderDto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
        orderDto.setShipmentStatus(order.getShipmentStatus() != null ? order.getShipmentStatus().name() : null);
        orderDto.setRefundRequestedAt(order.getRefundRequestedAt());
        orderDto.setRefundCompletedAt(order.getRefundCompletedAt());
        orderDto.setRefundReferenceId(order.getRefundReferenceId());

        orderDto.setAwb(order.getAwb());
        orderDto.setCourier(order.getCourier());
        orderDto.setTrackingStatus(order.getTrackingStatus());
        orderDto.setTrackingData(order.getTrackingData());
        orderDto.setCreatedAt(order.getCreatedAt());

        // Map Customer Details
        userRepository.findById(order.getUserId()).ifPresent(user -> {
            String name = "Unknown";
            if (user.getName() != null && !user.getName().isEmpty() && !user.getName().equalsIgnoreCase("Unknown")) {
                name = user.getName();
            } else if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
                name = user.getAddresses().get(0).getName();
            }
            orderDto.setUserName(name);
            orderDto.setUserEmail(user.getEmail());
            orderDto.setUserPhone(user.getMobileNumber());
        });

        return orderDto;
    }
}
