package com.professor.socialMedia.repository;

import com.professor.socialMedia.entity.SiteSetting;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface SiteSettingRepository extends MongoRepository<SiteSetting, ObjectId> {
    Optional<SiteSetting> findByKey(String key);
}
