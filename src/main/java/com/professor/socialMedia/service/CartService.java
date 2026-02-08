package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Cart;
import com.professor.socialMedia.entity.CartItem;
import com.professor.socialMedia.entity.Product;
import com.professor.socialMedia.repository.CartRepository;
import com.professor.socialMedia.repository.CategoryRepository;
import com.professor.socialMedia.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.professor.socialMedia.exception.GlobalExceptionHandler;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ProductRepository productRepository;

    public Cart getOrCreateCart(ObjectId userId){
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            return cartRepository.save(cart);
        });
    }

    public Cart addItem(ObjectId userId, CartItem item) {
        if (item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        Cart cart = getOrCreateCart(userId);
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }
        // Fetch product from DB
        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.isActive()) {
            throw new RuntimeException("Product is not available");
        }
        // Check stock (do NOT decrement here)
        int totalQty = item.getQuantity();
        for (CartItem existing : cart.getItems()) {
            if (existing.getProductId().equals(item.getProductId())) {
                totalQty += existing.getQuantity();
            }
        }
        if (totalQty > product.getStock()) {
            throw new RuntimeException("Not enough stock available");
        }
        // Merge or add
        for (CartItem existing : cart.getItems()) {
            if (existing.getProductId().equals(item.getProductId())) {
                existing.setQuantity(totalQty);
                cart.setUpdatedAt(Instant.now());
                return cartRepository.save(cart);
            }
        }
        // New item
        CartItem newItem = new CartItem();
        newItem.setProductId(product.getId());
        newItem.setQuantity(item.getQuantity());
        newItem.setPriceSnapshot(product.getPrice());

        cart.getItems().add(newItem);
        cart.setUpdatedAt(Instant.now());

        return cartRepository.save(cart);
    }


    public Cart updateItemQuantity(ObjectId userId, CartItem item) {
        if (item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        Cart cart = getOrCreateCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        for (CartItem existingItem : cart.getItems()) {
            if (existingItem.getProductId().equals(item.getProductId())) {
                existingItem.setQuantity(item.getQuantity());
                return cartRepository.save(cart);
            }
        }
        throw new RuntimeException("Item does not exist in cart");
    }


    public Cart removeItem(ObjectId userId, ObjectId productId) {
        Cart cart = getOrCreateCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        boolean removed = cart.getItems().removeIf(
                item -> item.getProductId().equals(productId)
        );
        if (!removed) {
            throw new RuntimeException("Item not found in cart");
        }
        return cartRepository.save(cart);
    }


}
