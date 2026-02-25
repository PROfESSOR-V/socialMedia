package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.OrderStatus;
import com.professor.socialMedia.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ShipmozoTrackingScheduler {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ShipmozoTrackingService trackingService;

    @Scheduled(fixedDelay = 30 * 60 * 1000) // every 30 minutes
    public void updateTrackingStatuses() {

        List<Order> activeOrders = orderRepository.findByTrackingStatusNot("DELIVERED");

        for (Order order : activeOrders) {

            if (order.getAwb() == null)
                continue;

            try {
                Map<String, Object> res = trackingService.track(order.getAwb());

                if (res != null) {
                    String status = (String) res.get("current_status");

                    if (status != null) {
                        order.setTrackingStatus(status);

                        if ("DELIVERED".equalsIgnoreCase(status)) {
                            order.setStatus(OrderStatus.DELIVERED);
                        }

                        orderRepository.save(order);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to track Shipmozo AWB " + order.getAwb() + ": " + e.getMessage());
            }
        }
    }
}
