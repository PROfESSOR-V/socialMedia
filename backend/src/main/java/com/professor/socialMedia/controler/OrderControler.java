package com.professor.socialMedia.controler;

import com.professor.socialMedia.Security.CustomUserDetail;
import com.professor.socialMedia.dto.OrderDto;
import com.professor.socialMedia.dto.mapper.OrderMapper;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.User;
import com.professor.socialMedia.service.OrderService;
import com.professor.socialMedia.service.UserService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderControler {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserService userService;

    /**
     * Create order from current user's cart
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@AuthenticationPrincipal CustomUserDetail user){
        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Order order = orderService.createFromCart(userEntity.getId());
        OrderDto orderDto = orderMapper.mapOrder(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Order created successfully", orderDto)
        );
    }

    /**
     * Get all orders for current authenticated user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrders(
            @AuthenticationPrincipal CustomUserDetail user)
    {
        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        List<Order> all =  orderService.findByUserId(userEntity.getId());
        List<OrderDto> order = all.stream()
                .map(orderMapper::mapOrder)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User orders retrieved successfully", order));
    }

    /**
     * Get specific order by ID (user can only see their own orders)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(
            @AuthenticationPrincipal CustomUserDetail user,
            @PathVariable String id)
    {
        User userEntity = userService.findByEmail(user.getUsername()).orElseThrow(
                ()-> new RuntimeException("User not found!")
        );
        Order order = orderService.findById(new ObjectId(id));
        if(order == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("Order not found")
            );
        }
        // Check if the order belongs to the current user
        if (!order.getUserId().equals(userEntity.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    ApiResponse.error("You don't have permission to view this order")
            );
        }

        OrderDto orderDto = orderMapper.mapOrder(order);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", orderDto));
    }

    /**
     * Get all orders for a specific user - ADMIN only
     */
    @GetMapping("/admin/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAdminUserOrders(
            @AuthenticationPrincipal CustomUserDetail user,
            @PathVariable String userId
    ){
        List<Order> orders = orderService.findByUserId(new ObjectId(userId));
        List<OrderDto> orderDtos = orders.stream().map(orderMapper::mapOrder).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User orders retrieved successfully", orderDtos));
    }

    /**
     * Get all orders - ADMIN only
     */
//    @GetMapping("/admin/all")
//    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllUserOrders(
//            @AuthenticationPrincipal CustomUserDetail user
//    )


}
