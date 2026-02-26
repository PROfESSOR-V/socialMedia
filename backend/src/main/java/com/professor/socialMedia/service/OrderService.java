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

            if (p.getStock() < ci.getQuantity()) {
                throw new RuntimeException("Not enough stock available for " + p.getId());
            }

            OrderItem oi = new OrderItem();
            oi.setProductId(p.getId());
            oi.setQuantity(ci.getQuantity());
            oi.setPriceSnapshot(p.getPrice());
            orderItems.add(oi);
            totalPrice += (p.getPrice() * ci.getQuantity());
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
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order cannot be cancelled in its current state: " + order.getStatus());
        }

        boolean wasPaid = order.getStatus() == OrderStatus.PAID;
        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        if (wasPaid) {
            // Refund stock if the order was already paid
            for (OrderItem item : order.getItems()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStock(p.getStock() + item.getQuantity());
                    productRepository.save(p);
                });
            }
        }
        return savedOrder;
    }
}
