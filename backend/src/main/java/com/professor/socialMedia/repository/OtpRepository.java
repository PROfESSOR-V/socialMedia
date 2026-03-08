package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.OtpRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpRepository extends MongoRepository<OtpRecord, String> {
    Optional<OtpRecord> findByPhone(String phone);
}
