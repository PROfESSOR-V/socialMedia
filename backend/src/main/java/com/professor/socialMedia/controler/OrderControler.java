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
        public ResponseEntity<ApiResponse<OrderDto>> createOrder(@AuthenticationPrincipal CustomUserDetail user) {
                User userEntity = userService.findByMobileNumber(user.getUsername()).orElseThrow(
                                () -> new RuntimeException("User not found!"));
                Order order = orderService.createFromCart(userEntity.getId());
                OrderDto orderDto = orderMapper.mapOrder(order);
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.success("Order created successfully", orderDto));
        }

        /**
         * Get all orders for current authenticated user
         */
        @GetMapping
        public ResponseEntity<ApiResponse<List<OrderDto>>> getOrders(
                        @AuthenticationPrincipal CustomUserDetail user) {
                User userEntity = userService.findByMobileNumber(user.getUsername()).orElseThrow(
                                () -> new RuntimeException("User not found!"));
                List<Order> all = orderService.findByUserId(userEntity.getId());
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
                        @PathVariable String id) {
                User userEntity = userService.findByMobileNumber(user.getUsername()).orElseThrow(
                                () -> new RuntimeException("User not found!"));
                Order order = orderService.findById(new ObjectId(id));
                if (order == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                        ApiResponse.error("Order not found"));
                }
                // Check if the order belongs to the current user or if the user is an ADMIN
                boolean isAdmin = user.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (!order.getUserId().equals(userEntity.getId()) && !isAdmin) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                                        ApiResponse.error("You don't have permission to view this order"));
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
                        @PathVariable String userId) {
                List<Order> orders = orderService.findByUserId(new ObjectId(userId));
                List<OrderDto> orderDtos = orders.stream().map(orderMapper::mapOrder).collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success("User orders retrieved successfully", orderDtos));
        }

        /**
         * Get all orders - ADMIN only
         */
        @GetMapping("/admin/all")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<OrderDto>>> getAllUserOrders(
                        @AuthenticationPrincipal CustomUserDetail user) {
                List<Order> orders = orderService.findAll();
                List<OrderDto> orderDtos = orders.stream().map(orderMapper::mapOrder).collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success("All orders retrieved successfully", orderDtos));
        }

        /**
         * Cancel an order by ID
         */
        @PostMapping("/{id}/cancel")
        public ResponseEntity<?> cancelOrder(
                        @AuthenticationPrincipal CustomUserDetail user,
                        @PathVariable String id,
                        @RequestBody(required = false) java.util.Map<String, String> body) {
                try {
                        String reason = null;
                        if (body != null && body.containsKey("reason")) {
                                reason = body.get("reason");
                        }

                        User userEntity = userService.findByMobileNumber(user.getUsername()).orElseThrow(
                                        () -> new RuntimeException("User not found!"));
                        Order order = orderService.findById(new ObjectId(id));
                        if (order == null) {
                                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                                ApiResponse.error("Order not found"));
                        }
                        // Check if the order belongs to the current user
                        if (!order.getUserId().equals(userEntity.getId())) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                                                ApiResponse.error("You don't have permission to view this order"));
                        }

                        Order cancelledOrder = orderService.cancelOrder(order, reason);
                        OrderDto orderDto = orderMapper.mapOrder(cancelledOrder);
                        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", orderDto));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                        ApiResponse.error(e.getMessage()));
                }
        }

        /**
         * Retry pushing shipment to Shipmozo - ADMIN only
         */
        @PostMapping("/{id}/ship/retry")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> retryShipment(
                        @AuthenticationPrincipal CustomUserDetail user,
                        @PathVariable String id) {
                try {
                        Order updatedOrder = orderService.retryShipment(new ObjectId(id));
                        OrderDto orderDto = orderMapper.mapOrder(updatedOrder);
                        return ResponseEntity.ok(ApiResponse.success("Shipment push retried successfully", orderDto));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                        ApiResponse.error(e.getMessage()));
                }
        }

        /**
         * Fetch AWB from Shipmozo manually - ADMIN only
         */
        @PostMapping("/{id}/fetch-awb")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> fetchAwb(
                        @AuthenticationPrincipal CustomUserDetail user,
                        @PathVariable String id) {
                try {
                        Order updatedOrder = orderService.fetchAwb(new ObjectId(id));
                        OrderDto orderDto = orderMapper.mapOrder(updatedOrder);
                        return ResponseEntity.ok(ApiResponse.success("AWB fetched successfully", orderDto));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                        ApiResponse.error(e.getMessage()));
                }
        }

        /**
         * Refresh Tracking
         */
        @GetMapping("/{id}/tracking/refresh")
        public ResponseEntity<?> refreshTracking(
                        @AuthenticationPrincipal CustomUserDetail user,
                        @PathVariable String id) {
                try {
                        Order refreshedOrder = orderService.refreshTracking(new ObjectId(id));
                        OrderDto orderDto = orderMapper.mapOrder(refreshedOrder);
                        return ResponseEntity.ok(ApiResponse.success("Tracking refreshed successfully", orderDto));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                        ApiResponse.error(e.getMessage()));
                }
        }

        /**
         * Refresh Refund
         */
        @GetMapping("/{id}/refund/refresh")
        public ResponseEntity<?> refreshRefund(
                        @AuthenticationPrincipal CustomUserDetail user,
                        @PathVariable String id) {
                try {
                        Order refreshedOrder = orderService.refreshRefund(new ObjectId(id));
                        OrderDto orderDto = orderMapper.mapOrder(refreshedOrder);
                        return ResponseEntity.ok(ApiResponse.success("Refund status refreshed successfully", orderDto));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                        ApiResponse.error(e.getMessage()));
                }
        }
}
