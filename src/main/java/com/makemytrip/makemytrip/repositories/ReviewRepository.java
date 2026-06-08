package com.makemytrip.makemytrip.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.makemytrip.makemytrip.models.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByEntityTypeAndEntityIdAndStatus(String entityType, String entityId, String status);
    List<Review> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<Review> findByStatus(String status);
}
