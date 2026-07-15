package com.makemytrip.makemytrip.controllers;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;

@RestController
@CrossOrigin(origins = "*")
public class RootController {
    private static final Logger logger = LoggerFactory.getLogger(RootController.class);

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/")
    public String home() {
        return "MakeMyTrip Backend Running";
    }

    @GetMapping("/hotel")
    public ResponseEntity<List<Hotel>> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/flight")
    public ResponseEntity<List<Flight>> getAllFlights() {
        List<Flight> flights = flightRepository.findAll();
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/hotel/search")
    public ResponseEntity<List<Hotel>> searchHotels(
            @RequestParam(required = false, defaultValue = "") String location,
            @RequestParam(required = false, defaultValue = "") String hotelName) {
        String locationValue = location == null ? "" : location.trim();
        String hotelNameValue = hotelName == null ? "" : hotelName.trim();

        Pattern locationRegex = Pattern.compile(Pattern.quote(locationValue), Pattern.CASE_INSENSITIVE);
        Pattern nameRegex = Pattern.compile(Pattern.quote(hotelNameValue), Pattern.CASE_INSENSITIVE);

        Query query = new Query();
        if (!locationValue.isEmpty() && !hotelNameValue.isEmpty()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("location").regex(locationRegex),
                    Criteria.where("hotelName").regex(nameRegex)
            ));
        } else if (!locationValue.isEmpty()) {
            query.addCriteria(Criteria.where("location").regex(locationRegex));
        } else if (!hotelNameValue.isEmpty()) {
            query.addCriteria(Criteria.where("hotelName").regex(nameRegex));
        }

        List<Hotel> hotels = mongoTemplate.find(query, Hotel.class, "hotels");
        logger.info("Hotel search received location='{}', hotelName='{}', results={}", locationValue, hotelNameValue, hotels.size());
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/flight/search")
    public ResponseEntity<List<Flight>> searchFlights(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to) {
        String fromValue = from == null ? "" : from.trim();
        String toValue = to == null ? "" : to.trim();

        Pattern fromRegex = Pattern.compile(Pattern.quote(fromValue), Pattern.CASE_INSENSITIVE);
        Pattern toRegex = Pattern.compile(Pattern.quote(toValue), Pattern.CASE_INSENSITIVE);

        Query query = new Query();
        if (!fromValue.isEmpty() && !toValue.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(
                    Criteria.where("from").regex(fromRegex),
                    Criteria.where("to").regex(toRegex)
            ));
        } else if (!fromValue.isEmpty()) {
            query.addCriteria(Criteria.where("from").regex(fromRegex));
        } else if (!toValue.isEmpty()) {
            query.addCriteria(Criteria.where("to").regex(toRegex));
        }

        List<Flight> flights = mongoTemplate.find(query, Flight.class, "flight");
        logger.info("Flight search received from='{}', to='{}', results={}", fromValue, toValue, flights.size());
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/flight/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable String id) {
        return flightRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    if (ObjectId.isValid(id)) {
                        Flight flight = mongoTemplate.findById(new ObjectId(id), Flight.class, "flight");
                        return flight != null ? ResponseEntity.ok(flight) : ResponseEntity.notFound().build();
                    }
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/hotel/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable String id) {
        return hotelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    if (ObjectId.isValid(id)) {
                        Hotel hotel = mongoTemplate.findById(new ObjectId(id), Hotel.class, "hotels");
                        return hotel != null ? ResponseEntity.ok(hotel) : ResponseEntity.notFound().build();
                    }
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/collections")
    public ResponseEntity<Set<String>> getCollectionNames() {
        Set<String> collectionNames = new HashSet<>(mongoTemplate.getCollectionNames());
        return ResponseEntity.ok(collectionNames);
    }

    @GetMapping("/collection/{name}")
    public ResponseEntity<List<Document>> getCollection(
            @PathVariable String name,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "0") int size) {
        List<Document> documents = getCollectionData(name, page, size);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/collection/{name}/{id}")
    public ResponseEntity<Document> getCollectionItemById(@PathVariable String name, @PathVariable String id) {
        String collectionName = resolveMongoCollectionName(name);
        if (collectionName != null) {
            Query query;
            if (ObjectId.isValid(id)) {
                query = new Query(
                        new Criteria().orOperator(
                                Criteria.where("_id").is(new ObjectId(id)),
                                Criteria.where("_id").is(id),
                                Criteria.where("id").is(id)));
            } else {
                query = new Query(
                        new Criteria().orOperator(
                                Criteria.where("_id").is(id),
                                Criteria.where("id").is(id)));
            }

            Document found = mongoTemplate.findOne(query, Document.class, collectionName);
            if (found != null) {
                return ResponseEntity.ok(found);
            }
        }

        List<Document> documents = getCollectionData(name);
        for (Document document : documents) {
            Object candidateId = document.get("id");
            if (candidateId == null) {
                candidateId = document.get("_id");
            }
            if (candidateId != null && candidateId.toString().equals(id)) {
                return ResponseEntity.ok(document);
            }
        }

        return ResponseEntity.notFound().build();
    }

    private List<Document> getCollectionData(String name) {
        return getCollectionData(name, 0, 0);
    }

    private List<Document> getCollectionData(String name, int page, int size) {
        if (name == null) {
            return new ArrayList<>();
        }

        String normalizedName = name.trim().toLowerCase();
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 0);
        // If a real collection exists in Mongo, prefer returning its documents.
        try {
            Set<String> names = new HashSet<>(mongoTemplate.getCollectionNames());
            if (names.contains(normalizedName)) {
                return fetchCollectionDocuments(normalizedName, safePage, safeSize);
            }
            // try to find close match
            for (String n : names) {
                String lower = n.toLowerCase();
                if (lower.equals(normalizedName) || lower.endsWith(normalizedName) || lower.contains(normalizedName)) {
                    logger.info("Using existing collection '{}' for request '{}'", n, normalizedName);
                    return fetchCollectionDocuments(n, safePage, safeSize);
                }
            }
        } catch (Exception ex) {
            logger.warn("Error checking collection names: {}", ex.getMessage());
        }

        return switch (normalizedName) {
            case "homestays" -> List.of(
                        new Document("id", "hs-1")
                                .append("hotelName", "Beachside Homestay")
                                .append("location", "Goa")
                                .append("pricePerNight", 6200)
                                .append("availableRooms", 4)
                                .append("amenities", "Breakfast, Wi-Fi, Local Guide")
                                .append("description", "A cozy beachfront stay with local meals and warm hospitality."),
                        new Document("id", "hs-2")
                                .append("hotelName", "Hill View Homestay")
                                .append("location", "Manali")
                                .append("pricePerNight", 5400)
                                .append("availableRooms", 6)
                                .append("amenities", "Bonfire, Mountain View, Parking")
                                .append("description", "Wake up to panoramic views and a peaceful mountain retreat."));
            case "holidays" -> List.of(
                        new Document("id", "hd-1")
                                .append("packageName", "Goa Escape")
                                .append("destination", "Goa")
                                .append("duration", "5 Days / 4 Nights")
                                .append("price", 28999)
                                .append("description", "Beachfront stay, curated tours, and private transfers.")
                                .append("highlights", "Sunset cruise, spa access, city tour")
                                .append("inclusions", "Meals, airport transfer, sightseeing"),
                        new Document("id", "hd-2")
                                .append("packageName", "Himalayan Adventure")
                                .append("destination", "Manali")
                                .append("duration", "7 Days / 6 Nights")
                                .append("price", 34999)
                                .append("description", "Explore the mountains with a premium holiday itinerary.")
                                .append("highlights", "Cable car ride, local food tour, adventure sports")
                                .append("inclusions", "Stay, meals, guided activities"));
                    case "trains" -> List.of(
                        new Document("id", "tr-1")
                                .append("trainName", "Rajdhani Express")
                                .append("from", "Delhi")
                                .append("to", "Mumbai")
                                .append("departureTime", "2026-07-10T20:00:00")
                                .append("arrivalTime", "2026-07-11T12:30:00")
                                .append("price", 1800)
                                .append("availableSeats", 24)
                                .append("description", "Comfort-first journey with AC coaches and evening meals."),
                        new Document("id", "tr-2")
                                .append("trainName", "Shatabdi Express")
                                .append("from", "Mumbai")
                                .append("to", "Bengaluru")
                                .append("departureTime", "2026-07-12T06:30:00")
                                .append("arrivalTime", "2026-07-12T14:00:00")
                                .append("price", 1450)
                                .append("availableSeats", 18)
                                .append("description", "Fast, comfortable travel for business and leisure."));
                    case "buses" -> List.of(
                        new Document("id", "bs-1")
                                .append("busName", "Volvo Sleeper")
                                .append("from", "Delhi")
                                .append("to", "Jaipur")
                                .append("travelDate", "2026-07-10T21:30:00")
                                .append("price", 950)
                                .append("availableSeats", 12)
                                .append("description", "Luxury sleeper service with reclining seats and onboard Wi-Fi."),
                        new Document("id", "bs-2")
                                .append("busName", "AC Seater")
                                .append("from", "Mumbai")
                                .append("to", "Pune")
                                .append("travelDate", "2026-07-11T08:00:00")
                                .append("price", 650)
                                .append("availableSeats", 20)
                                .append("description", "Comfortable air-conditioned buses for day travel."));
                    case "cabs" -> List.of(
                        new Document("id", "cb-1")
                                .append("cabType", "Outstation Cab")
                                .append("city", "Delhi")
                                .append("from", "Delhi")
                                .append("to", "Agra")
                                .append("pricePerKm", 14)
                                .append("available", true)
                                .append("description", "Reliable local and outstation cabs with professional drivers."),
                        new Document("id", "cb-2")
                                .append("cabType", "Airport Transfer")
                                .append("city", "Bengaluru")
                                .append("from", "Airport")
                                .append("to", "City Center")
                                .append("pricePerKm", 11)
                                .append("available", true)
                                .append("description", "Hassle-free airport pickups and drop-offs."));
            case "forex" -> List.of(
                        new Document("id", "fx-1")
                                .append("currency", "USD")
                                .append("buyRate", 84.50)
                                .append("sellRate", 83.90)
                                .append("description", "Competitive USD to INR rates with doorstep delivery."),
                        new Document("id", "fx-2")
                                .append("currency", "EUR")
                                .append("buyRate", 92.10)
                                .append("sellRate", 91.30)
                                .append("description", "Secure euro exchange for your upcoming travels."));
            case "insurance" -> List.of(
                        new Document("id", "in-1")
                                .append("planName", "Travel Secure")
                                .append("coverage", "₹10 Lakhs")
                                .append("premium", 1299)
                                .append("description", "Coverage for trip delays, cancellations, and medical emergencies."),
                        new Document("id", "in-2")
                                .append("planName", "Annual Travel Plus")
                                .append("coverage", "₹25 Lakhs")
                                .append("premium", 2599)
                                .append("description", "Annual protection for frequent travelers and family trips."));
            default -> {
                try {
                    // Attempt to find a collection with the requested name or similar
                    Set<String> names = new HashSet<>(mongoTemplate.getCollectionNames());
                    if (names.contains(normalizedName)) {
                        yield fetchCollectionDocuments(normalizedName, safePage, safeSize);
                    }
                    // try to find a close match (contains or endsWith)
                    String match = null;
                    for (String n : names) {
                        String lower = n.toLowerCase();
                        if (lower.equals(normalizedName) || lower.endsWith(normalizedName) || lower.contains(normalizedName)) {
                            match = n;
                            break;
                        }
                    }
                    if (match != null) {
                        logger.info("Using collection '{}' for requested '{}'", match, normalizedName);
                        yield fetchCollectionDocuments(match, safePage, safeSize);
                    }
                    yield new ArrayList<>();
                } catch (Exception ex) {
                    logger.warn("Failed to fetch collection {}: {}", normalizedName, ex.getMessage());
                    yield new ArrayList<>();
                }
            }
        };
    }

    private String resolveMongoCollectionName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }

        String normalizedName = name.trim().toLowerCase();
        try {
            Set<String> names = new HashSet<>(mongoTemplate.getCollectionNames());
            if (names.contains(normalizedName)) {
                return normalizedName;
            }
            for (String n : names) {
                String lower = n.toLowerCase();
                if (lower.equals(normalizedName) || lower.endsWith(normalizedName) || lower.contains(normalizedName)) {
                    return n;
                }
            }
        } catch (Exception ex) {
            logger.warn("Failed to resolve collection '{}': {}", normalizedName, ex.getMessage());
        }
        return null;
    }

    private List<Document> fetchCollectionDocuments(String collectionName, int page, int size) {
        Query query = new Query();
        if (size > 0) {
            query.skip((long) page * size);
            query.limit(size);
        }
        return mongoTemplate.find(query, Document.class, collectionName);
    }

    @GetMapping("/test")
    public String test() {
        return "API Working";
    }
}
