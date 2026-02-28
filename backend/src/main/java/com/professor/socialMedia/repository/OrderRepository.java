package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.Order;
import com.professor.socialMedia.entity.ShipmentStatus;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, ObjectId> {

    List<Order> findByUserId(ObjectId id);

    Optional<Order> findByIdAndUserId(ObjectId orderId, ObjectId userId);

    Optional<Order> findByShipmentAwb(String awb);

    List<Order> findByShipmentStatusNot(ShipmentStatus shipmentStatus);

}
