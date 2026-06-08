import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://make-my-trip-clone-springboot-2tzx.onrender.com";

export const getCollection = async (collection) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/collection/${collection}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching collection ${collection}:`, error);
    return [];
  }
};

export const login = async (email, password) => {
  try {
    const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`;
    const res = await axios.post(url);
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  password
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/signup`, {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getuserbyemail = async (email) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/user/email?email=${email}`);
    const data = res.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const editprofile = async (
  id,
  firstName,
  lastName,
  email,
  phoneNumber
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/edit?id=${id}`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    const data = res.data;
    return data;
  } catch (error) {}
};
export const getflight = async () => {
  return getCollection("flight");
};

export const addflight = async (
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/flight`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const editflight = async (
  id,
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/flight/${id}`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const gethotel = async () => {
  return getCollection("hotels");
};

export const addhotel = async (
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/hotel`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const edithotel = async (
  id,
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/hotel/${id}`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handleflightbooking = async (userId, flightId, seats, price) => {
  try {
    const url = `${BACKEND_URL}/booking/flight?userId=${userId}&flightId=${flightId}&seats=${seats}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handlehotelbooking = async (userId, hotelId, rooms, price) => {
  try {
    const url = `${BACKEND_URL}/booking/hotel?userId=${userId}&hotelId=${hotelId}&rooms=${rooms}&price=${price}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getReviews = async (entityType, entityId, sort = "newest", stars) => {
  try {
    let url = `${BACKEND_URL}/reviews?entityType=${entityType}&entityId=${entityId}&sort=${sort}`;
    if (stars) {
      url += `&stars=${stars}`;
    }
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const getReviewSummary = async (entityType, entityId) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/reviews/summary?entityType=${entityType}&entityId=${entityId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching review summary:", error);
    return { averageRating: 0, reviewCount: 0, ratingBreakdown: {} };
  }
};

export const postReview = async (review) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews`, review);
    return res.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

export const postReviewReply = async (reviewId, reply) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews/${reviewId}/reply`, reply);
    return res.data;
  } catch (error) {
    console.error("Error posting review reply:", error);
    throw error;
  }
};

export const flagReview = async (reviewId, userId, reason) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews/${reviewId}/flag`, {
      userId,
      reason,
    });
    return res.data;
  } catch (error) {
    console.error("Error flagging review:", error);
    throw error;
  }
};

export const moderateReview = async (reviewId, status) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/reviews/${reviewId}/moderate`, { status });
    return res.data;
  } catch (error) {
    console.error("Error moderating review:", error);
    throw error;
  }
};

export const getFlaggedReviews = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/reviews/flagged`);
    return res.data;
  } catch (error) {
    console.error("Error fetching flagged reviews:", error);
    return [];
  }
};

export const cancelBooking = async (userId, bookingId, type, reason) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/booking/cancel`, {
      userId,
      bookingId,
      type,
      reason,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
