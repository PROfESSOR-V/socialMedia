package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.*;
import com.professor.socialMedia.repository.CartRepository;
import com.professor.socialMedia.repository.OrderRepository;
import com.professor.socialMedia.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private com.professor.socialMedia.repository.PaymentRepository paymentRepository;
    @Autowired
    private ShipmozoShipmentService shipmozoShipmentService;
    @Autowired
    private ShipmozoTrackingService shipmozoTrackingService;
    @Autowired
    private CashfreeService cashfreeService;
    @Autowired
    private CouponService couponService;

    public Order createFromCart(ObjectId userId, String couponCode) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Cart not found or not active"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0;

        for (CartItem ci : cart.getItems()) {
            Product p = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found" + ci.getProductId()));

            if (!p.getActive()) {
                throw new RuntimeException("Product is not active");
            }
            if (ci.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid quantity");
            }

            double effectivePrice = 0.0;
            int effectiveStock = p.getStock();
            boolean isVariantSelected = ci.getVariantName() != null && !ci.getVariantName().isEmpty()
                    && p.getVariants() != null;

            if (isVariantSelected) {
                var variantOpt = p.getVariants().stream()
                        .filter(v -> v.getName().equals(ci.getVariantName()))
                        .findFirst();
                if (variantOpt.isPresent()) {
                    effectivePrice = variantOpt.get().getDiscountPrice() != null ? variantOpt.get().getDiscountPrice()
                            : variantOpt.get().getActualPrice();
                    effectiveStock = variantOpt.get().getStock();
                } else {
                    throw new RuntimeException("Selected variant does not exist for product " + p.getId());
                }
            }

            if (effectiveStock < ci.getQuantity()) {
                throw new RuntimeException("Not enough stock available for " + p.getId());
            }

            // Deduct stock here
            if (isVariantSelected) {
                for (ProductVariant variant : p.getVariants()) {
                    if (variant.getName().equals(ci.getVariantName())) {
                        variant.setStock(variant.getStock() - ci.getQuantity());
                        break;
                    }
                }
            } else {
                p.setStock(p.getStock() - ci.getQuantity());
            }
            productRepository.save(p);

            OrderItem oi = new OrderItem();
            oi.setProductId(p.getId());
            oi.setQuantity(ci.getQuantity());
            oi.setPriceSnapshot(effectivePrice);
            oi.setVariantName(ci.getVariantName());
            orderItems.add(oi);
            totalPrice += (effectivePrice * ci.getQuantity());
        }

        // Apply coupon if provided
        double discountAmount = 0;
        String appliedCouponCode = null;
        String couponHeading = null;
        ObjectId freeProductId = null;
        String freeProductName = null;

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            try {
                Map<String, Object> couponResult = couponService.validateAndApply(
                        couponCode, userId, cart.getItems().size(), totalPrice);

                String couponType = (String) couponResult.get("type");
                appliedCouponCode = (String) couponResult.get("code");
                couponHeading = (String) couponResult.get("heading");

                if ("DISCOUNT".equals(couponType)) {
                    discountAmount = ((Number) couponResult.get("discountAmount")).doubleValue();
                    totalPrice = Math.max(0, totalPrice - discountAmount);
                } else if ("PRODUCT".equals(couponType)) {
                    // Add free product as order item with price 0
                    String fpId = (String) couponResult.get("freeProductId");
                    freeProductId = new ObjectId(fpId);
                    freeProductName = (String) couponResult.get("freeProductName");

                    OrderItem freeItem = new OrderItem();
                    freeItem.setProductId(freeProductId);
                    freeItem.setQuantity(1);
                    freeItem.setPriceSnapshot(0.0);
                    orderItems.add(freeItem);
                }
            } catch (RuntimeException e) {
                throw new RuntimeException("Coupon error: " + e.getMessage());
            }
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setTotalAmount(totalPrice);
        order.setStatus(OrderStatus.PENDING);
        order.setCartId(cart.getId());

        // Set coupon fields
        if (appliedCouponCode != null) {
            order.setCouponCode(appliedCouponCode);
            order.setCouponHeading(couponHeading);
            order.setDiscountAmount(discountAmount);
            order.setFreeProductId(freeProductId);
            order.setFreeProductName(freeProductName);
        }

        Order saved = orderRepository.save(order);
        // Do NOT convert cart here so users can retry payment if they cancel.
        // Webhook handles clearing items on success.

        return saved;
    }

    public List<Order> findByUserId(ObjectId id) {
        return orderRepository.findByUserId(id);
    }

    public Order findById(ObjectId id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findByIdAndUserId(ObjectId objectId, ObjectId id) {
        return orderRepository.findByIdAndUserId(objectId, id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order cancelOrder(Order order, String reason) {
        ShipmentStatus shipmentStatus = order.getShipmentStatus();
        if (shipmentStatus == ShipmentStatus.PICKED_UP ||
                shipmentStatus == ShipmentStatus.IN_TRANSIT ||
                shipmentStatus == ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Order cannot be cancelled after Out for Pickup");
        }

        boolean wasPaid = order.getStatus() == OrderStatus.PAID;
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);

        if (wasPaid) {
            order.setPaymentStatus(PaymentStatus.REFUND_INITIATED);
            order.setRefundRequestedAt(java.time.Instant.now());
            // Restore inventory immediately
            for (OrderItem item : order.getItems()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    boolean isVariantSelected = item.getVariantName() != null && !item.getVariantName().isEmpty()
                            && p.getVariants() != null;
                    if (isVariantSelected) {
                        for (ProductVariant variant : p.getVariants()) {
                            if (variant.getName().equals(item.getVariantName())) {
                                variant.setStock(variant.getStock() + item.getQuantity());
                                break;
                            }
                        }
                    } else {
                        p.setStock(p.getStock() + item.getQuantity());
                    }
                    productRepository.save(p);
                });
            }
        }

        return orderRepository.save(order);
    }

    public Order retryShipment(ObjectId orderId) {
        Order order = findById(orderId);

        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Cannot retry shipment. Order is not PAID.");
        }

        if (order.getShipment() != null && order.getShipment().getAwb() != null
                && !order.getShipment().getAwb().isEmpty()) {
            throw new RuntimeException("Cannot retry shipment. Order already has an AWB assigned.");
        }

        try {
            java.util.Map<String, Object> shipmozoRes = shipmozoShipmentService.createShipment(order);
            if (shipmozoRes != null && "1".equals(String.valueOf(shipmozoRes.get("result")))) {
                order.setShipmozoMsg("Success");
                java.util.Map<String, Object> data = (java.util.Map<String, Object>) shipmozoRes.get("data");
                if (data != null && data.containsKey("order_id")) {
                    order.setShipmozoOrderId(String.valueOf(data.get("order_id")));
                }
            } else {
                order.setShipmozoMsg("Failed");
            }
            orderRepository.save(order);
            return order;
        } catch (Exception e) {
            order.setShipmozoMsg("Failed");
            orderRepository.save(order);
            throw new RuntimeException("Failed to retry Shipmozo shipment: " + e.getMessage());
        }
    }

    public Order fetchAwb(ObjectId orderId) {
        Order order = findById(orderId);

        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Cannot fetch AWB. Order is not PAID.");
        }

        if (order.getShipment() != null && order.getShipment().getAwb() != null
                && !order.getShipment().getAwb().isEmpty()) {
            throw new RuntimeException("Order already has an AWB assigned.");
        }

        if (order.getShipmozoOrderId() == null || order.getShipmozoOrderId().isEmpty()) {
            throw new RuntimeException("No Shipmozo Order ID found. Push order to Shipmozo first.");
        }

        try {
            java.util.Map<String, Object> res = shipmozoShipmentService.fetchOrderDetails(order.getShipmozoOrderId());
            if (res != null && "1".equals(String.valueOf(res.get("result")))) {
                java.util.List<java.util.Map<String, Object>> dataList = (java.util.List<java.util.Map<String, Object>>) res
                        .get("data");
                if (dataList != null && !dataList.isEmpty()) {
                    java.util.Map<String, Object> data = dataList.get(0);
                    java.util.Map<String, Object> shippingDetails = (java.util.Map<String, Object>) data
                            .get("shipping_details");

                    if (shippingDetails != null && shippingDetails.get("awb_number") != null
                            && !String.valueOf(shippingDetails.get("awb_number")).isEmpty()) {
                        ShipmentInfo info = order.getShipment() != null ? order.getShipment() : new ShipmentInfo();
                        info.setAwb(String.valueOf(shippingDetails.get("awb_number")));
                        info.setCourier(String.valueOf(shippingDetails.get("courier_company")));
                        info.setCurrentStatus("Courier Assigned");
                        order.setShipment(info);
                        return orderRepository.save(order);
                    } else {
                        throw new RuntimeException(
                                "AWB not yet generated in Shipmozo. Assign a courier on Shipmozo dashboard first.");
                    }
                }
            }
            throw new RuntimeException("Failed to fetch order details from Shipmozo.");
        } catch (Exception e) {
            throw new RuntimeException("Error fetching AWB: " + e.getMessage());
        }
    }

    public Order refreshTracking(ObjectId orderId) {
        Order order = findById(orderId);
        ShipmentInfo shipment = order.getShipment();

        if (shipment == null || shipment.getAwb() == null || shipment.getAwb().isEmpty()) {
            return order; // Return unchanged as shipment hasn't started yet
        }

        try {
            java.util.Map<String, Object> res = shipmozoTrackingService.track(shipment.getAwb());
            if (res != null) {
                String status = (String) res.get("current_status");
                if (status != null) {
                    shipment.setCurrentStatus(status);
                    shipment.setOrderStatus((String) res.get("order_status"));
                    shipment.setLastSyncedAt(java.time.Instant.now());

                    Object expectedDelivery = res.get("expected_delivery_date");
                    if (expectedDelivery instanceof String && !((String) expectedDelivery).isEmpty()) {
                        try {
                            shipment.setExpectedDeliveryDate(
                                    java.time.Instant.parse(((String) expectedDelivery).replace(" ", "T") + "Z"));
                        } catch (Exception ex) {
                            // Ignore parsing errors for expected delivery date
                        }
                    }

                    Object statusTime = res.get("status_time");
                    if (statusTime instanceof String && !((String) statusTime).isEmpty()) {
                        try {
                            shipment.setStatusTime(
                                    java.time.Instant.parse(((String) statusTime).replace(" ", "T") + "Z"));
                        } catch (Exception ex) {
                            // Ignore parsing errors for status time
                        }
                    }

                    Object scanDetailsObj = res.get("scan_detail");
                    if (scanDetailsObj instanceof java.util.List) {
                        java.util.List<java.util.Map<String, Object>> scans = (java.util.List<java.util.Map<String, Object>>) scanDetailsObj;
                        java.util.List<TrackingEvent> events = new java.util.ArrayList<>();
                        for (java.util.Map<String, Object> s : scans) {
                            TrackingEvent e = new TrackingEvent();
                            e.setStatus((String) s.get("status"));
                            e.setLocation((String) s.get("location"));

                            Object dateObj = s.get("date");
                            if (dateObj instanceof String) {
                                try {
                                    e.setDate(java.time.Instant.parse(((String) dateObj).replace(" ", "T") + "Z"));
                                } catch (Exception ex) {
                                    // ignore event if date fails
                                }
                            }
                            events.add(e);
                        }
                        shipment.setTimeline(events);
                    }

                    try {
                        String trackingJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(res);
                        String lowerJson = trackingJson.toLowerCase();

                        if (lowerJson.contains("delivered") || lowerJson.contains("completed")) {
                            order.setShipmentStatus(ShipmentStatus.DELIVERED);
                            order.setStatus(OrderStatus.DELIVERED);
                        } else if (lowerJson.contains("in transit") || lowerJson.contains("vehicle departed")
                                || lowerJson.contains("bag added to trip")) {
                            order.setShipmentStatus(ShipmentStatus.IN_TRANSIT);
                        } else if (lowerJson.contains("out for delivery")) {
                            order.setShipmentStatus(ShipmentStatus.IN_TRANSIT);
                        } else if (lowerJson.contains("out for pickup") || lowerJson.contains("shipment picked up")) {
                            order.setShipmentStatus(ShipmentStatus.PICKED_UP);
                        } else if (lowerJson.contains("manifest") || lowerJson.contains("pickup scheduled")) {
                            order.setShipmentStatus(ShipmentStatus.MANIFESTED);
                        }
                    } catch (Exception ex) {
                        System.err.println("Failed to parse tracking JSON data for AWB: " + shipment.getAwb());
                    }

                    if ("DELIVERED".equalsIgnoreCase(status)) {
                        order.setStatus(OrderStatus.DELIVERED);
                        order.setShipmentStatus(ShipmentStatus.DELIVERED);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to track Shipmozo AWB "
                    + (shipment != null ? shipment.getAwb() : "unknown") + ": " + e.getMessage());
        }

        return orderRepository.save(order);
    }

    public Order refreshRefund(ObjectId orderId) {
        Order order = findById(orderId);

        try {
            com.professor.socialMedia.entity.Payment payment = paymentRepository
                    .findByOrderIdAndStatus(orderId, com.professor.socialMedia.entity.PaymentStatus.SUCCESS)
                    .orElseThrow(() -> new RuntimeException("No successful payment found for order."));

            String cfPaymentId = payment.getProviderPaymentId();
            if (cfPaymentId == null || cfPaymentId.isEmpty()) {
                throw new RuntimeException("Provider payment ID is missing.");
            }

            java.util.Map<String, Object> paymentDetails = cashfreeService.getPaymentDetails(cfPaymentId);
            if (paymentDetails == null || !paymentDetails.containsKey("order_id")) {
                throw new RuntimeException("Could not fetch order ID from Cashfree");
            }
            String cashfreeOrderId = (String) paymentDetails.get("order_id");

            java.util.List<java.util.Map<String, Object>> refunds = cashfreeService.getRefundsForOrder(cashfreeOrderId);
            if (refunds != null && !refunds.isEmpty()) {
                boolean hasSuccess = false;
                boolean hasFailed = false;
                String refundId = null;

                for (java.util.Map<String, Object> r : refunds) {
                    String status = (String) r.get("refund_status");
                    refundId = (String) r.get("refund_id");
                    if ("SUCCESS".equalsIgnoreCase(status)) {
                        hasSuccess = true;
                        break;
                    } else if ("FAILED".equalsIgnoreCase(status)) {
                        hasFailed = true;
                    }
                }

                if (hasSuccess) {
                    order.setPaymentStatus(PaymentStatus.REFUNDED);
                    order.setRefundReferenceId(refundId);
                    order.setRefundCompletedAt(java.time.Instant.now());
                    order.setStatus(OrderStatus.REFUNDED);
                } else if (hasFailed) {
                    order.setPaymentStatus(PaymentStatus.REFUND_FAILED);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to sync refund status: " + e.getMessage());
        }
        return orderRepository.save(order);
    }
}
