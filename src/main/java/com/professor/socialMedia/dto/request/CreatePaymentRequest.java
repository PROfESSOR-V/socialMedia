package com.professor.socialMedia.dto.request;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private String orderId;
    private String provider;
}
