package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Cart;
import com.professor.socialMedia.entity.CartItem;
import com.professor.socialMedia.entity.CartStatus;
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

    public Cart getOrCreateCart(ObjectId userId) {
        return cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            cart.setStatus(CartStatus.ACTIVE);
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
        if (!product.getActive()) {
            throw new RuntimeException("Product is not available");
        }

        // Determine effective price and stock based on variant
        double effectivePrice = product.getPrice() != null ? product.getPrice() : 0.0;
        int effectiveStock = product.getStock();

        if (item.getVariantName() != null && !item.getVariantName().isEmpty() && product.getVariants() != null) {
            var variantOpt = product.getVariants().stream()
                    .filter(v -> v.getName().equals(item.getVariantName()))
                    .findFirst();
            if (variantOpt.isPresent()) {
                effectivePrice = variantOpt.get().getPrice();
                effectiveStock = variantOpt.get().getStock();
            } else {
                throw new RuntimeException("Selected variant does not exist");
            }
        }

        // Check stock (do NOT decrement here)
        int totalQty = item.getQuantity();
        for (CartItem existing : cart.getItems()) {
            boolean isSameProduct = existing.getProductId().equals(item.getProductId());
            boolean isSameVariant = (existing.getVariantName() == null && item.getVariantName() == null) ||
                    (existing.getVariantName() != null && existing.getVariantName().equals(item.getVariantName()));

            if (isSameProduct && isSameVariant) {
                totalQty += existing.getQuantity();
            }
        }
        if (totalQty > effectiveStock) {
            throw new RuntimeException("Not enough stock available for this variation");
        }

        // Merge or add
        for (CartItem existing : cart.getItems()) {
            boolean isSameProduct = existing.getProductId().equals(item.getProductId());
            boolean isSameVariant = (existing.getVariantName() == null && item.getVariantName() == null) ||
                    (existing.getVariantName() != null && existing.getVariantName().equals(item.getVariantName()));

            if (isSameProduct && isSameVariant) {
                existing.setQuantity(totalQty);
                existing.setPriceSnapshot(effectivePrice); // Update price snapshot just in case it changed
                cart.setUpdatedAt(Instant.now());
                return cartRepository.save(cart);
            }
        }
        // New item
        CartItem newItem = new CartItem();
        newItem.setProductId(product.getId());
        newItem.setQuantity(item.getQuantity());
        newItem.setPriceSnapshot(effectivePrice);
        newItem.setVariantName(item.getVariantName());

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
            boolean isSameProduct = existingItem.getProductId().equals(item.getProductId());
            boolean isSameVariant = (existingItem.getVariantName() == null && item.getVariantName() == null) ||
                    (existingItem.getVariantName() != null
                            && existingItem.getVariantName().equals(item.getVariantName()));

            if (isSameProduct && isSameVariant) {
                existingItem.setQuantity(item.getQuantity());
                return cartRepository.save(cart);
            }
        }
        throw new RuntimeException("Item does not exist in cart");
    }

    public Cart removeItem(ObjectId userId, CartItem requestItem) {
        Cart cart = getOrCreateCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        boolean removed = cart.getItems().removeIf(item -> {
            boolean isSameProduct = item.getProductId().equals(requestItem.getProductId());
            boolean isSameVariant = (item.getVariantName() == null && requestItem.getVariantName() == null) ||
                    (item.getVariantName() != null && item.getVariantName().equals(requestItem.getVariantName()));
            return isSameProduct && isSameVariant;
        });

        if (!removed) {
            throw new RuntimeException("Item not found in cart");
        }
        return cartRepository.save(cart);
    }

    public void clearCart(ObjectId userId) {
        Cart cart = getOrCreateCart(userId);
        cart.setItems(new ArrayList<>());
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
    }

}
