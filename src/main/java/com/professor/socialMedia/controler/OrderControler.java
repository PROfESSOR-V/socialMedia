package com.professor.socialMedia.controler;

import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.service.OrderService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderControler {

    @Autowired
    private OrderService orderService;

    @PostMapping("/{userId}")
    public ResponseEntity<Order> createOrder(@PathVariable String userId){
        Order order = orderService.createFromCart(new ObjectId(userId));
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrders(@PathVariable String userId){
        List<Order> all =  orderService.findByUserId(new ObjectId(userId));
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable String id){
        Order order = orderService.findById(new ObjectId(id));
        return new ResponseEntity<>(order, HttpStatus.OK);
    }
}
