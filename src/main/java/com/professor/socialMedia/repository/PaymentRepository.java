package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Payment;
import com.professor.socialMedia.entity.PaymentStatus;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, ObjectId> {

    Optional<Payment> findByOrderIdAndStatus(ObjectId orderId, PaymentStatus status);

    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
}
