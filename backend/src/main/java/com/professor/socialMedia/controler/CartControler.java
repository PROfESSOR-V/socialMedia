package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.CartDto;
import com.professor.socialMedia.dto.mapper.CartMapper;
import com.professor.socialMedia.dto.request.AddToCartRequest;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Cart;
import com.professor.socialMedia.entity.CartItem;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.CartService;
import com.professor.socialMedia.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartControler {

    @Autowired
    private CartService cartService;

    @Autowired
    private CartMapper cartMapper;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal CustomUserDetail user) {
        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Cart cart = cartService.getOrCreateCart(userEntity.getId());
        CartDto cartDto = cartMapper.mapCart(cart);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cartDto));
    }


    // add items in carts
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(@AuthenticationPrincipal CustomUserDetail user,
                                                        @RequestBody AddToCartRequest req) {
        CartItem item = new CartItem();
        item.setQuantity(req.getQuantity());
        item.setProductId(new ObjectId(req.getProductId()));

        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Cart cart = cartService.addItem(userEntity.getId(), item);
        CartDto cartDto = cartMapper.mapCart(cart);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Item added to cart successfully", cartDto)
        );
    }

    //update item quantity in cart
    @PutMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> updateItem(
            @AuthenticationPrincipal CustomUserDetail user,
            @RequestBody AddToCartRequest request) {

        CartItem item = new CartItem();
        item.setProductId(new ObjectId(request.getProductId()));
        item.setQuantity(request.getQuantity());

        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Cart cart = cartService.updateItemQuantity(userEntity.getId(), item);
        CartDto cartDto = cartMapper.mapCart(cart);
        return ResponseEntity.ok(ApiResponse.success("Item quantity updated successfully", cartDto));
    }

    /**
     * Remove item from current user's cart
     */
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartDto>> deleteItem(
            @AuthenticationPrincipal CustomUserDetail user,
            @PathVariable String productId) {

        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Cart cart = cartService.removeItem(userEntity.getId(), new ObjectId(productId));
        CartDto cartDto = cartMapper.mapCart(cart);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", cartDto));
    }


    @DeleteMapping("/items")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@AuthenticationPrincipal CustomUserDetail user){
        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        cartService.clearCart(userEntity.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
