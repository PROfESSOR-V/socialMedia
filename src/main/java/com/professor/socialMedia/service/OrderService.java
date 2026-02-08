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
import java.util.Optional;


@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;


    public Order createFromCart(ObjectId userId){
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if( cart.getItems() == null ||  cart.getItems().isEmpty() ){
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0;

        for( CartItem ci : cart.getItems() ){
            Product p = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found" + ci.getProductId()));

            if( !p.isActive()){
                throw new RuntimeException("Product is not active");
            }
            if(ci.getQuantity()<=0){
                throw new IllegalArgumentException("Invalid quantity");
            }

            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);

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
        order.setStatus(OrderStatus.CREATED);

        Order saved = orderRepository.save(order);
        cartRepository.delete(cart);

        return saved;
    }

    public List<Order> findByUserId(ObjectId id){
        return orderRepository.findByUserId(id);
    }

    public Order findById(ObjectId id){
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
