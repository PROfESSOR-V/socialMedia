package com.professor.socialMedia.dto.request;

import lombok.Data;

@Data
public class PaymentWebhookRequest {
    private String orderId;
    private String paymentId;
    private String status;
}

