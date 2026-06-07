package com.makemytrip.makemytrip.services;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Users.Booking;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;

@Service
public class BookingService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public Booking bookFlight(String userId,String flightId,int seats,double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Flight> flightOptional =flightRepository.findById(flightId);
        if(usersOptional.isPresent() && flightOptional.isPresent()){
            Users user=usersOptional.get();
            Flight flight=flightOptional.get();
            if(flight.getAvailableSeats() >= seats){
                flight.setAvailableSeats(flight.getAvailableSeats()- seats);
                flightRepository.save(flight);

                Booking booking=new Booking();
                booking.setType("Flight");
                booking.setBookingId(UUID.randomUUID().toString());
                booking.setReferenceId(flightId);
                booking.setDate(LocalDateTime.now().toString());
                booking.setQuantity(seats);
                booking.setTotalPrice(price);
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }
    public Booking bookhotel(String userId,String hotelId,int rooms,double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if(usersOptional.isPresent() && hotelOptional.isPresent()){
            Users user=usersOptional.get();
            Hotel hotel=hotelOptional.get();
            if(hotel.getAvailableRooms() >= rooms){
                hotel.setAvailableRooms(hotel.getAvailableRooms()- rooms);
                hotelRepository.save(hotel);

                Booking booking=new Booking();
                booking.setType("Hotel");
                booking.setBookingId(UUID.randomUUID().toString());
                booking.setReferenceId(hotelId);
                booking.setDate(LocalDateTime.now().toString());
                booking.setQuantity(rooms);
                booking.setTotalPrice(price);
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough rooms available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }

    public Users cancelBooking(String userId, String bookingId, String type, String reason){
        Optional<Users> usersOptional = userRepository.findById(userId);
        if(usersOptional.isPresent()){
            Users user = usersOptional.get();
            Booking booking = user.getBookings().stream()
                    .filter(b -> bookingId.equals(b.getBookingId()) && type.equalsIgnoreCase(b.getType()))
                    .findFirst()
                    .orElse(null);
            if(booking == null){
                throw new RuntimeException("Booking not found for user");
            }
            if("Cancelled".equalsIgnoreCase(booking.getBookingStatus())){
                throw new RuntimeException("Booking is already cancelled");
            }

            double refundAmount = calculateRefundAmount(booking);
            booking.setBookingStatus("Cancelled");
            booking.setRefundStatus("Pending");
            booking.setRefundAmount(refundAmount);
            booking.setRefundReason(reason);
            booking.setCancellationReason(reason);
            booking.setCancellationDate(LocalDateTime.now().toString());
            booking.setRefundTimeline("3-5 business days");

            if("Flight".equalsIgnoreCase(type)){
                Optional<Flight> flightOptional = flightRepository.findById(booking.getReferenceId());
                if(flightOptional.isPresent()){
                    Flight flight = flightOptional.get();
                    flight.setAvailableSeats(flight.getAvailableSeats() + booking.getQuantity());
                    flightRepository.save(flight);
                }
            } else if("Hotel".equalsIgnoreCase(type)){
                Optional<Hotel> hotelOptional = hotelRepository.findById(booking.getReferenceId());
                if(hotelOptional.isPresent()){
                    Hotel hotel = hotelOptional.get();
                    hotel.setAvailableRooms(hotel.getAvailableRooms() + booking.getQuantity());
                    hotelRepository.save(hotel);
                }
            }
            userRepository.save(user);
            return user;
        }
        throw new RuntimeException("User not found");
    }

    private double calculateRefundAmount(Booking booking) {
        LocalDateTime bookedAt = parseBookingDate(booking.getDate());
        if(bookedAt != null){
            long hoursPassed = Duration.between(bookedAt, LocalDateTime.now()).toHours();
            if(hoursPassed <= 24){
                return Math.round(booking.getTotalPrice() * 50.0) / 100.0;
            }
            if(hoursPassed <= 72){
                return Math.round(booking.getTotalPrice() * 25.0) / 100.0;
            }
        }
        return 0.0;
    }

    private LocalDateTime parseBookingDate(String dateString) {
        try {
            return LocalDateTime.parse(dateString);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateString).atStartOfDay();
            } catch (DateTimeParseException ignored) {
                return LocalDateTime.now().minusDays(10);
            }
        }
    }
}
