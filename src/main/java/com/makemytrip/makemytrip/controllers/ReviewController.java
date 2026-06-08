package com.makemytrip.makemytrip.controllers;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.makemytrip.makemytrip.models.Review;
import com.makemytrip.makemytrip.models.ReviewReply;
import com.makemytrip.makemytrip.repositories.ReviewRepository;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<Review>> getReviews(
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestParam(required = false, defaultValue = "approved") String status,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false) Integer stars) {

        List<Review> reviews = reviewRepository.findByEntityTypeAndEntityIdAndStatus(entityType, entityId, status);

        if (stars != null) {
            reviews = reviews.stream().filter(r -> r.getRating() == stars).collect(Collectors.toList());
        }

        switch (sort) {
            case "mostHelpful":
                reviews.sort(Comparator.comparingInt(Review::getHelpfulCount).reversed().thenComparing(Review::getCreatedAt).reversed());
                break;
            case "highestRated":
                reviews.sort(Comparator.comparingInt(Review::getRating).reversed().thenComparing(Review::getCreatedAt).reversed());
                break;
            default:
                reviews.sort(Comparator.comparing(Review::getCreatedAt).reversed());
                break;
        }

        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getReviewSummary(
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestParam(required = false, defaultValue = "approved") String status) {

        List<Review> reviews = reviewRepository.findByEntityTypeAndEntityIdAndStatus(entityType, entityId, status);
        double average = 0.0;
        int count = reviews.size();
        Map<Integer, Integer> ratingBreakdown = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            ratingBreakdown.put(star, 0);
        }

        int total = 0;
        for (Review review : reviews) {
            ratingBreakdown.computeIfPresent(review.getRating(), (key, value) -> value + 1);
            total += review.getRating();
        }

        if (count > 0) {
            average = (double) total / count;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", average);
        summary.put("reviewCount", count);
        summary.put("ratingBreakdown", ratingBreakdown);

        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            review.setRating(Math.max(1, Math.min(5, review.getRating())));
        }
        if (review.getPhotoUrls() == null) {
            review.setPhotoUrls(new ArrayList<>());
        }
        if (review.getReplies() == null) {
            review.setReplies(new ArrayList<>());
        }
        review.setHelpfulCount(0);
        review.setFlagCount(0);
        review.setStatus("approved");
        review.setCreatedAt(new Date());
        review.setUpdatedAt(new Date());
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Review> addReply(@PathVariable String id, @RequestBody ReviewReply reply) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        if (reply.getCreatedAt() == null) {
            reply.setCreatedAt(new Date());
        }
        if (reply.getId() == null || reply.getId().isEmpty()) {
            reply.setId(java.util.UUID.randomUUID().toString());
        }
        if (review.getReplies() == null) {
            review.setReplies(new ArrayList<>());
        }
        review.getReplies().add(reply);
        review.setUpdatedAt(new Date());
        reviewRepository.save(review);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{id}/flag")
    public ResponseEntity<Review> flagReview(@PathVariable String id, @RequestBody Map<String, String> request) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        review.setFlagCount(review.getFlagCount() + 1);
        review.setStatus("flagged");
        review.setUpdatedAt(new Date());
        reviewRepository.save(review);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/flagged")
    public ResponseEntity<List<Review>> getFlaggedReviews() {
        List<Review> flagged = reviewRepository.findByStatus("flagged");
        flagged.sort(Comparator.comparingInt(Review::getFlagCount).reversed().thenComparing(Review::getCreatedAt).reversed());
        return ResponseEntity.ok(flagged);
    }

    @PostMapping("/{id}/moderate")
    public ResponseEntity<Review> moderateReview(@PathVariable String id, @RequestBody Map<String, String> request) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        String status = request.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (!status.equals("approved") && !status.equals("rejected") && !status.equals("flagged")) {
            return ResponseEntity.badRequest().build();
        }
        review.setStatus(status);
        review.setUpdatedAt(new Date());
        reviewRepository.save(review);
        return ResponseEntity.ok(review);
    }
}
