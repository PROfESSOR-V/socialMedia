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
        orderDto.setId(order.getId() != null ? order.getId().toString() : null);
        orderDto.setUserId(order.getUserId() != null ? order.getUserId().toString() : null);
        if (order.getItems() != null) {
            orderDto.setItems(order.getItems().stream().map(item -> {
                OrderItemDto itemDto = new OrderItemDto();
                itemDto.setProductId(item.getProductId() != null ? item.getProductId().toString() : null);
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPrice(item.getPriceSnapshot());
                itemDto.setVariantName(item.getVariantName());

                if (item.getProductId() != null) {
                    productRepository.findById(item.getProductId()).ifPresent(product -> {
                        itemDto.setProductName(product.getName());
                    });
                }

                return itemDto;
            }).collect(Collectors.toList()));
        }

        orderDto.setTotalAmount(order.getTotalAmount());
        orderDto.setStatus(order.getStatus());
        orderDto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
        orderDto.setShipmentStatus(order.getShipmentStatus() != null ? order.getShipmentStatus().name() : null);
        orderDto.setRefundRequestedAt(order.getRefundRequestedAt());
        orderDto.setRefundCompletedAt(order.getRefundCompletedAt());
        orderDto.setRefundReferenceId(order.getRefundReferenceId());
        orderDto.setShipmozoMsg(order.getShipmozoMsg());
        orderDto.setShipmozoOrderId(order.getShipmozoOrderId());
        orderDto.setCancelReason(order.getCancelReason());

        // Map Coupon Fields
        orderDto.setCouponCode(order.getCouponCode());
        orderDto.setCouponHeading(order.getCouponHeading());
        orderDto.setDiscountAmount(order.getDiscountAmount());
        orderDto.setFreeProductId(order.getFreeProductId() != null ? order.getFreeProductId().toString() : null);
        orderDto.setFreeProductName(order.getFreeProductName());

        orderDto.setShipment(order.getShipment());
        orderDto.setShippingAddress(order.getShippingAddress());
        orderDto.setPaymentId(order.getPaymentId() != null ? order.getPaymentId().toString() : null);
        orderDto.setCreatedAt(order.getCreatedAt());
        orderDto.setUpdatedAt(order.getUpdatedAt());

        // Map Customer Details
        if (order.getUserId() != null) {
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
        }

        return orderDto;
    }
}
