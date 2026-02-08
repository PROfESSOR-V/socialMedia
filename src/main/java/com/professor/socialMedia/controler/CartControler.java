package com.professor.socialMedia.controler;

import com.professor.socialMedia.entity.Cart;
import com.professor.socialMedia.entity.CartItem;
import com.professor.socialMedia.service.CartService;
import jakarta.websocket.server.PathParam;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartControler {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        Cart cart = cartService.getOrCreateCart(new ObjectId(userId));
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<Cart> addItem(@PathVariable String userId, @RequestBody CartItem item) {
        Cart cart = cartService.addItem(new ObjectId(userId), item);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    //update item quantity in cart
    @PutMapping("/{userId}/items")
    public ResponseEntity<Cart> updateItem(@PathVariable String userId, @RequestBody CartItem item) {
        Cart cart = cartService.updateItemQuantity(new ObjectId(userId), item);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @DeleteMapping("/{userId}/items")
    public ResponseEntity<Cart> deleteItem(@PathVariable String userId, @RequestParam String productId) {
        Cart cart = cartService.removeItem(new ObjectId(userId), new ObjectId(productId));
        return new  ResponseEntity<>(cart, HttpStatus.OK);
    }
}
