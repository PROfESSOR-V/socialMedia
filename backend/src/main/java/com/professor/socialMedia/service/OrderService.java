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
    private ShipmozoShipmentService shipmozoShipmentService;

    public Order createFromCart(ObjectId userId) {
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

            double effectivePrice = p.getPrice() != null ? p.getPrice() : 0.0;
            int effectiveStock = p.getStock();
            boolean isVariantSelected = ci.getVariantName() != null && !ci.getVariantName().isEmpty()
                    && p.getVariants() != null;

            if (isVariantSelected) {
                var variantOpt = p.getVariants().stream()
                        .filter(v -> v.getName().equals(ci.getVariantName()))
                        .findFirst();
                if (variantOpt.isPresent()) {
                    effectivePrice = variantOpt.get().getPrice();
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
        Order order = new Order();
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setTotalAmount(totalPrice);
        order.setStatus(OrderStatus.PENDING);
        order.setCartId(cart.getId());

        Order saved = orderRepository.save(order);
        // Do NOT convert cart here so users can retry payment if they cancel.
        // Webhook handles clearing items on success.
        // cart.setStatus(CartStatus.CONVERTED);
        // cartRepository.save(cart);

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

    public Order cancelOrder(Order order) {
        ShipmentStatus shipmentStatus = order.getShipmentStatus();
        if (shipmentStatus == ShipmentStatus.PICKED_UP ||
                shipmentStatus == ShipmentStatus.IN_TRANSIT ||
                shipmentStatus == ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Order cannot be cancelled after Out for Pickup");
        }

        boolean wasPaid = order.getStatus() == OrderStatus.PAID;
        order.setStatus(OrderStatus.CANCELLED);

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

        if (order.getAwb() != null && !order.getAwb().isEmpty()) {
            throw new RuntimeException("Cannot retry shipment. Order already has an AWB assigned.");
        }

        try {
            shipmozoShipmentService.createShipment(order);
            // Re-fetch since createShipment modifies and saves the order
            return findById(orderId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retry Shipmozo shipment: " + e.getMessage());
        }
    }
}
