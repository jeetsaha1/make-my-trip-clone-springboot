package com.makemytrip.makemytrip.controllers;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;

@RestController
@CrossOrigin(origins = "*")
public class RootController {
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