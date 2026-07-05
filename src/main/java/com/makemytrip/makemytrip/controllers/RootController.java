package com.makemytrip.makemytrip.controllers;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.bson.Document;
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
    public ResponseEntity<List<Hotel>> getallhotel(){
        List<Hotel> hotels=hotelRepository.findAll();
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/flight")
    public ResponseEntity<List<Flight>> getallflights(){
        List<Flight> flights=flightRepository.findAll();
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

    @GetMapping("/collections")
    public ResponseEntity<Set<String>> getCollectionNames() {
        Set<String> collectionNames = new HashSet<>(mongoTemplate.getCollectionNames());
        return ResponseEntity.ok(collectionNames);
    }

    @GetMapping("/collection/{name}")
    public ResponseEntity<List<Document>> getCollection(@PathVariable String name) {
        List<Document> documents = mongoTemplate.findAll(Document.class, name);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/test")
        public String test() {
            return "API Working";
        }

}