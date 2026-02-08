package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Payment;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, ObjectId> {

    Optional<Payment> findByOrderId(ObjectId objectId);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
}
