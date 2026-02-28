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

    // @Scheduled(fixedDelay = 30 * 60 * 1000) // every 30 minutes (Disabled by user
    // request)
    public void updateTrackingStatuses() {

        List<Order> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getShipmentStatus() != null
                        && o.getShipmentStatus() != com.professor.socialMedia.entity.ShipmentStatus.DELIVERED)
                .toList();

        for (Order order : activeOrders) {

            if (order.getShipment() == null || order.getShipment().getAwb() == null)
                continue;

            String awb = order.getShipment().getAwb();

            try {
                Map<String, Object> res = trackingService.track(awb);

                if (res != null) {
                    String status = (String) res.get("current_status");

                    if (status != null) {
                        order.getShipment().setCurrentStatus(status);

                        try {
                            String trackingJson = new com.fasterxml.jackson.databind.ObjectMapper()
                                    .writeValueAsString(res);
                            String lowerJson = trackingJson.toLowerCase();

                            if (lowerJson.contains("delivered") || lowerJson.contains("completed")) {
                                order.setShipmentStatus(com.professor.socialMedia.entity.ShipmentStatus.DELIVERED);
                                order.setStatus(OrderStatus.DELIVERED);
                            } else if (lowerJson.contains("in transit") || lowerJson.contains("vehicle departed")) {
                                order.setShipmentStatus(com.professor.socialMedia.entity.ShipmentStatus.IN_TRANSIT);
                            } else if (lowerJson.contains("out for pickup")
                                    || lowerJson.contains("shipment picked up")) {
                                order.setShipmentStatus(com.professor.socialMedia.entity.ShipmentStatus.PICKED_UP);
                            } else if (lowerJson.contains("manifest") || lowerJson.contains("pickup scheduled")) {
                                order.setShipmentStatus(com.professor.socialMedia.entity.ShipmentStatus.MANIFESTED);
                            }
                        } catch (Exception ex) {
                            System.err.println("Failed to parse tracking JSON data for AWB: " + awb);
                        }

                        if ("DELIVERED".equalsIgnoreCase(status)) {
                            order.setStatus(OrderStatus.DELIVERED);
                            order.setShipmentStatus(com.professor.socialMedia.entity.ShipmentStatus.DELIVERED);
                        }

                        orderRepository.save(order);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to track Shipmozo AWB " + awb + ": " + e.getMessage());
            }
        }
    }
}
