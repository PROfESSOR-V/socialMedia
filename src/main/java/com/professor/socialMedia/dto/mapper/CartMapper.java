package com.professor.socialMedia.dto.mapper;

import com.professor.socialMedia.dto.CartDto;
import com.professor.socialMedia.entity.Cart;
import lombok.extern.apachecommons.CommonsLog;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CartMapper {
    public CartDto mapCart(Cart cart){
        CartDto cartDto = new CartDto();
        cartDto.setId(cart.getId().toString());
        cartDto.setUserId(cart.getUserId().toString());
        cartDto.setItems(cart.getItems().stream().map(item -> {
            com.professor.socialMedia.dto.CartItemDto itemDto = new com.professor.socialMedia.dto.CartItemDto();
            itemDto.setProductId(item.getProductId().toString());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPriceSnapshot());
            return itemDto;
        }).collect(Collectors.toList()));

        cartDto.setTotalPrice(calculateTotalPrice(cart));
        return cartDto;
    }

    public Double calculateTotalPrice(Cart cart){
        return cart.getItems().stream()
                .mapToDouble(item -> item.getPriceSnapshot() * item.getQuantity())
                .sum();
    }
}
