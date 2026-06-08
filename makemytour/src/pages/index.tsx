import { getflight, gethotel } from "@/api";
import Loader from "@/components/Loader";
import { SearchSelect } from "@/components/SearchSelect";
import SignupDialog from "@/components/SignupDialog";
import { Button } from "@/components/ui/button";
import {
  Bus,
  Calendar,
  Car,
  CreditCard,
  HomeIcon,
  Hotel,
  MapPin,
  Plane,
  QrCode,
  Shield,
  Train,
  Umbrella,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function Home() {
  const [bookingtype, setbookingtype] = useState("flights");
  const [from, setfrom] = useState("");
  const [to, setto] = useState("");
  const [date, setdate] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [travelers, settravelers] = useState(1);
  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [hotel, sethotel] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [flight, setflight] = useState<any[]>([]);
  const [guests, setguests] = useState(1);
  const [currency, setcurrency] = useState("USD");
  const [amount, setamount] = useState("");
  const [policyType, setpolicyType] = useState("Travel");
  const [coverage, setcoverage] = useState("1000000");
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const flightD = [
    { id: 1, from: "Delhi", to: "Mumbai", date: "2025-01-15", price: 5000 },
    { id: 2, from: "Mumbai", to: "Bengaluru", date: "2025-01-16", price: 4500 },
    { id: 3, from: "Bengaluru", to: "Delhi", date: "2025-01-17", price: 5500 },
    { id: 4, from: "Delhi", to: "Kolkata", date: "2025-01-18", price: 6000 },
  ];

  const hotelData = [
    { id: 1, name: "Luxury Palace", city: "Mumbai", price: 15000 },
    { id: 2, name: "Comfort Inn", city: "Delhi", price: 8000 },
    { id: 3, name: "Seaside Resort", city: "Goa", price: 12000 },
    { id: 4, name: "Mountain View Hotel", city: "Shimla", price: 10000 },
  ];
  const offers = useMemo(() => {
    const baseOffers: any = {
      flights: [
        {
          title: "Domestic Flights",
          description: "Get up to 20% off on domestic flights",
          imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800",
        },
        {
          title: "International Flights",
          description: "Explore global destinations",
          imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800",
        },
        {
          title: "Last Minute Flights",
          description: "Amazing deals on last-minute bookings",
          imageUrl: "https://images.unsplash.com/photo-1455218873509-8097f427b1d2?auto=format&fit=crop&w=800",
        },
      ],
      hotels: [
        {
          title: "Luxury Hotels",
          description: "5-star hotels at discounted rates",
          imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
        },
        {
          title: "Budget Hotels",
          description: "Affordable stays in major cities",
          imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800",
        },
        {
          title: "Resort Stays",
          description: "Escape to paradise resorts",
          imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
        },
      ],
      homestays: [
        {
          title: "Urban Homestays",
          description: "Authentic stays in city centers",
          imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ee9c470a0?auto=format&fit=crop&w=800",
        },
        {
          title: "Beach Homestays",
          description: "Beachfront living experiences",
          imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
        },
        {
          title: "Mountain Homestays",
          description: "Peaceful mountain retreats",
          imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
        },
      ],
      holidays: [
        {
          title: "Goa Holiday Packages",
          description: "Beach holidays with exclusive discounts",
          imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
        },
        {
          title: "Kashmir Tours",
          description: "Explore the valley of paradise",
          imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
        },
        {
          title: "Himalayan Adventure",
          description: "Thrilling mountain experiences",
          imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
        },
      ],
      trains: [
        {
          title: "Luxury Trains",
          description: "Experience premium train journeys",
          imageUrl: "https://images.unsplash.com/photo-1474161855733-7671a73ce54d?auto=format&fit=crop&w=800",
        },
        {
          title: "Budget Trains",
          description: "Affordable train travel across India",
          imageUrl: "https://images.unsplash.com/photo-1474161855733-7671a73ce54d?auto=format&fit=crop&w=800",
        },
        {
          title: "Rajdhani Express",
          description: "Swift connections between major cities",
          imageUrl: "https://images.unsplash.com/photo-1474161855733-7671a73ce54d?auto=format&fit=crop&w=800",
        },
      ],
      buses: [
        {
          title: "AC Coaches",
          description: "Comfortable long-distance bus travels",
          imageUrl: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=800",
        },
        {
          title: "Night Buses",
          description: "Safe overnight bus journeys",
          imageUrl: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=800",
        },
        {
          title: "Sleeper Buses",
          description: "Sleep peacefully while you travel",
          imageUrl: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=800",
        },
      ],
      cabs: [
        {
          title: "Outstation Cabs",
          description: "Reliable cabs for outstation trips",
          imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800",
        },
        {
          title: "Airport Transfers",
          description: "Hassle-free airport pickups",
          imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800",
        },
        {
          title: "Hourly Rentals",
          description: "Rent cabs by the hour for city travel",
          imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800",
        },
      ],
      forex: [
        {
          title: "Best Exchange Rates",
          description: "Get the best forex conversion rates",
          imageUrl: "https://images.unsplash.com/photo-1633683715463-66d36294d71c?auto=format&fit=crop&w=800",
        },
        {
          title: "Travel Money Cards",
          description: "Global travel with prepaid forex cards",
          imageUrl: "https://images.unsplash.com/photo-1633683715463-66d36294d71c?auto=format&fit=crop&w=800",
        },
        {
          title: "Currency Exchange",
          description: "Fast and secure currency conversion",
          imageUrl: "https://images.unsplash.com/photo-1633683715463-66d36294d71c?auto=format&fit=crop&w=800",
        },
      ],
      insurance: [
        {
          title: "Travel Insurance",
          description: "Comprehensive coverage for your trips",
          imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800",
        },
        {
          title: "Flight Insurance",
          description: "Flight delay & cancellation coverage",
          imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800",
        },
        {
          title: "Annual Travel Insurance",
          description: "Coverage for unlimited trips",
          imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800",
        },
      ],
    };
    return baseOffers[bookingtype] || baseOffers.flights;
  }, [bookingtype]);

  const collections = [
    {
      title: "Stays in & Around Delhi",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Mumbai",
      imageUrl:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Bangalore",
      imageUrl:
        "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800",
      tag: "TOP 9",
    },
    {
      title: "Beach Destinations",
      imageUrl:
        "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
      tag: "TOP 11",
    },
  ];

  const wonders = [
    {
      title: "Shimla's Best Kept Secret",
      imageUrl:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800",
    },
    {
      title: "Tamil Nadu's Charming Hill Town",
      imageUrl:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800",
    },
    {
      title: "Quaint Little Hill Station in Gujarat",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
    },
    {
      title: "A pleasant summer retreat",
      imageUrl:
        "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800",
    },
  ];

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await gethotel();
        sethotel(data);
        const flightdata = await getflight();
        setflight(flightdata);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };

    fetchdata();
  }, [user]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    (flight || []).forEach((flight) => {
      cities.add(flight.from);
      cities.add(flight.to);
    });

    (hotel || []).forEach((hotel) => {
      cities.add(hotel.location);
    });
    return Array.from(cities).map((city) => ({ value: city, label: city }));
  }, [flight, hotel]);

  if (loading) {
    return <Loader />;
  }
  const handlesearch = () => {
    if (bookingtype === "flights") {
      const results = flight.filter(
        (FLIGHT) =>
          FLIGHT.from.toLowerCase() === from.toLowerCase() &&
          FLIGHT.to.toLowerCase() === to.toLowerCase()
      );
      setsearchresult(results);
    } else if (bookingtype === "hotels" || bookingtype === "homestays") {
      const results = hotel.filter(
        (hotel) => hotel.location.toLowerCase() === to.toLowerCase()
      );
      setsearchresult(results);
    }
  };
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  };
  const handlebooknow = (id: any) => {
    if (bookingtype === "flights") {
      router.push(`/book-flight/${id}`);
    } else if (bookingtype === "hotels" || bookingtype === "homestays") {
      router.push(`/book-hotel/${id}`);
    } else {
      // fallback to hotel booking for other types
      router.push(`/book-hotel/${id}`);
    }
  };

  const handleOfferBook = (offerTitle: string) => {
    const titleLower = offerTitle.toLowerCase();
    if (titleLower.includes("flight")) {
      router.push(`/book-flight/${flightD[0].id}`);
    } else if (titleLower.includes("hotel")) {
      router.push(`/book-hotel/${hotelData[0].id}`);
    } else if (titleLower.includes("train") || titleLower.includes("rajdhani")) {
      alert("Train booking feature coming soon!");
    } else if (titleLower.includes("bus")) {
      alert("Bus booking feature coming soon!");
    } else if (titleLower.includes("cab")) {
      alert("Cab booking feature coming soon!");
    } else if (titleLower.includes("forex") || titleLower.includes("currency")) {
      alert("Forex booking feature coming soon!");
    } else if (titleLower.includes("insurance") || titleLower.includes("travel")) {
      alert("Insurance booking feature coming soon!");
    } else {
      router.push(`/book-flight/${flightD[0].id}`);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80")',
      }}
    >
      <main className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl mb-6 p-4 overflow-x-auto">
          <div className="flex justify-between items-center min-w-max space-x-8">
            <NavItem
              icon={<Plane />}
              text="Flights"
              active={bookingtype === "flights"}
              onClick={() => setbookingtype("flights")}
            />
            <NavItem
              icon={<Hotel />}
              text="Hotels"
              active={bookingtype === "hotels"}
              onClick={() => setbookingtype("hotels")}
            />
            <NavItem
              icon={<HomeIcon />}
              text="Homestays"
              active={bookingtype === "homestays"}
              onClick={() => setbookingtype("homestays")}
            />
            <NavItem
              icon={<Umbrella />}
              text="Holiday"
              active={bookingtype === "holidays"}
              onClick={() => setbookingtype("holidays")}
            />
            <NavItem
              icon={<Train />}
              text="Trains"
              active={bookingtype === "trains"}
              onClick={() => setbookingtype("trains")}
            />
            <NavItem
              icon={<Bus />}
              text="Buses"
              active={bookingtype === "buses"}
              onClick={() => setbookingtype("buses")}
            />
            <NavItem
              icon={<Car />}
              text="Cabs"
              active={bookingtype === "cabs"}
              onClick={() => setbookingtype("cabs")}
            />
            <NavItem
              icon={<CreditCard />}
              text="Forex"
              active={bookingtype === "forex"}
              onClick={() => setbookingtype("forex")}
            />
            <NavItem
              icon={<Shield />}
              text="Insurance"
              active={bookingtype === "insurance"}
              onClick={() => setbookingtype("insurance")}
            />
          </div>
        </nav>

        <div className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* FLIGHTS FORM */}
            {bookingtype === "flights" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="From"
                    value={from}
                    onChange={setfrom}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city or airport"
                  />
                </div>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="To"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city or airport"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setdate(e.target.value)
                    }
                    subtitle="Select a date"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Travelers"
                    value={travelers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      settravelers(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of travelers"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* HOTELS FORM */}
            {bookingtype === "hotels" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="City"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Check-in"
                    value={checkin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckin(e.target.value)
                    }
                    subtitle="Select check-in"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Check-out"
                    value={checkout}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckout(e.target.value)
                    }
                    subtitle="Select check-out"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Guests"
                    value={guests.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setguests(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of guests"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* HOMESTAYS FORM */}
            {bookingtype === "homestays" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="Location"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city or area"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Check-in"
                    value={checkin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckin(e.target.value)
                    }
                    subtitle="Select check-in"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Check-out"
                    value={checkout}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckout(e.target.value)
                    }
                    subtitle="Select check-out"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Guests"
                    value={guests.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setguests(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of guests"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* HOLIDAYS FORM */}
            {bookingtype === "holidays" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="Destination"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Select destination"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Start Date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setdate(e.target.value)
                    }
                    subtitle="Select start date"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Duration (days)"
                    value={travelers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      settravelers(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of days"
                    type="number"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Travelers"
                    value={guests.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setguests(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of travelers"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* TRAINS FORM */}
            {bookingtype === "trains" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="From"
                    value={from}
                    onChange={setfrom}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="To"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Journey Date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setdate(e.target.value)
                    }
                    subtitle="Select date"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Passengers"
                    value={travelers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      settravelers(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of passengers"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* BUSES FORM */}
            {bookingtype === "buses" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="From"
                    value={from}
                    onChange={setfrom}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="To"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Travel Date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setdate(e.target.value)
                    }
                    subtitle="Select date"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Passengers"
                    value={travelers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      settravelers(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of passengers"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* CABS FORM */}
            {bookingtype === "cabs" && (
              <>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="Pickup Location"
                    value={from}
                    onChange={setfrom}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter pickup city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchSelect
                    options={cityOptions}
                    placeholder="Drop Location"
                    value={to}
                    onChange={setto}
                    icon={<MapPin className="text-gray-400" />}
                    subtitle="Enter drop city"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Travel Date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setdate(e.target.value)
                    }
                    subtitle="Select date"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Seats"
                    value={travelers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      settravelers(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of seats"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  SEARCH
                </Button>
              </>
            )}

            {/* FOREX FORM */}
            {bookingtype === "forex" && (
              <>
                <div className="col-span-1">
                  <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 truncate">From Currency</div>
                        <select
                          value={currency}
                          onChange={(e) => setcurrency(e.target.value)}
                          className="font-semibold w-full bg-transparent outline-none"
                        >
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                          <option>JPY</option>
                          <option>AUD</option>
                        </select>
                        <div className="text-xs text-gray-400 truncate">Select currency</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 truncate">To Currency</div>
                        <select
                          value="INR"
                          onChange={() => {}}
                          className="font-semibold w-full bg-transparent outline-none"
                        >
                          <option>INR</option>
                        </select>
                        <div className="text-xs text-gray-400 truncate">Indian Rupees</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<CreditCard className="text-gray-400" />}
                    placeholder="Amount"
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setamount(e.target.value)
                    }
                    subtitle="Enter amount"
                    type="number"
                  />
                </div>
                <div></div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  CONVERT
                </Button>
              </>
            )}

            {/* INSURANCE FORM */}
            {bookingtype === "insurance" && (
              <>
                <div className="col-span-1">
                  <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
                    <div className="flex items-center space-x-2">
                      <Shield className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 truncate">Policy Type</div>
                        <select
                          value={policyType}
                          onChange={(e) => setpolicyType(e.target.value)}
                          className="font-semibold w-full bg-transparent outline-none"
                        >
                          <option>Travel</option>
                          <option>Flight</option>
                          <option>Trip Cancellation</option>
                          <option>Annual</option>
                        </select>
                        <div className="text-xs text-gray-400 truncate">Select type</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
                    <div className="flex items-center space-x-2">
                      <Shield className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-500 truncate">Coverage</div>
                        <select
                          value={coverage}
                          onChange={(e) => setcoverage(e.target.value)}
                          className="font-semibold w-full bg-transparent outline-none"
                        >
                          <option value="500000">₹5 Lakhs</option>
                          <option value="1000000">₹10 Lakhs</option>
                          <option value="2000000">₹20 Lakhs</option>
                          <option value="5000000">₹50 Lakhs</option>
                        </select>
                        <div className="text-xs text-gray-400 truncate">Select coverage</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Calendar className="text-gray-400" />}
                    placeholder="Start Date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setdate(e.target.value)
                    }
                    subtitle="Select start date"
                    type="date"
                  />
                </div>
                <div className="col-span-1">
                  <SearchInput
                    icon={<Users className="text-gray-400" />}
                    placeholder="Duration (days)"
                    value={travelers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      settravelers(parseInt(e.target.value) || 1)
                    }
                    subtitle="Number of days"
                    type="number"
                  />
                </div>
                <Button className="col-span-1 h-full" onClick={handlesearch}>
                  GET QUOTE
                </Button>
              </>
            )}
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Search Results
            </h2>
            {searchresults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchresults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                  >
                    {bookingtype === "flights" ? (
                      <>
                        <p className="font-semibold text-lg">
                          Flight Name: {result.flightName}
                        </p>
                        <h3 className="font-semibold text-lg">
                          {result.from} to {result.to}
                        </h3>
                        <p className="text-gray-600">
                          Departure Time: {formatDate(result.departureTime)}
                        </p>
                        <p className="text-gray-600">
                          Arrival Time: {formatDate(result.arrivalTime)}
                        </p>
                        <p className="text-lg font-bold mt-2">
                          ₹{result.price}
                        </p>
                        <Button
                          className="w-full mt-4"
                          onClick={() => handlebooknow(result.id)}
                        >
                          Book Now
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg">
                          {result.hotelName}
                        </h3>
                        <p className="text-gray-600">City: {result.location}</p>
                        <p className="text-lg font-bold mt-2">
                          ₹{result.pricePerNight} per night
                        </p>
                        <Button
                          className="w-full mt-4"
                          onClick={() => handlebooknow(result.id)}
                        >
                          Book Now
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                No {bookingtype} available for the selected criteria.
              </p>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          {/* Offers Section */}
          <section className="my-16">
            <h2 className="text-2xl font-bold mb-8 text-white">Best Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer: any, index: number) => (
                <OfferCard
                  key={index}
                  {...offer}
                  onClick={() => handleOfferBook(offer.title)}
                />
              ))}
            </div>
          </section>

          {/* Collections Section */}
          <section className="my-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Handpicked Collections for You
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((collection, index) => (
                <CollectionCard key={index} {...collection} />
              ))}
            </div>
          </section>

          {/* Wonders Section */}
          <section className="my-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Unlock Lesser-Known <span></span> Wonders of India
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wonders.map((wonder, index) => (
                <WonderCard key={index} {...wonder} />
              ))}
            </div>
          </section>

          {/* Download App Section */}
          <DownloadApp />
        </div>
      </main>
    </div>
  );
}
const OfferCard = ({ title, description, imageUrl, onClick }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={onClick}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const CollectionCard = ({ title, imageUrl, tag }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black text-sm font-semibold px-2 py-1 rounded">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};
const DownloadApp = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto my-12">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">Download App Now!</h3>
          <p className="text-gray-600 mb-4">
            Get India&apos;s #1 travel super app with best deals on flights
          </p>
          <div className="flex space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="App Store"
              className="h-10"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Play Store"
              className="h-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <QrCode className="w-24 h-24" />
          <p className="text-sm text-gray-600">
            Scan QR code to download the app
          </p>
        </div>
      </div>
    </div>
  );
};

const WonderCard = ({ title, imageUrl }: any) => {
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};
function NavItem({ icon, text, active = false, onClick }: any) {
  return (
    <button
      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
        active ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm mt-1 whitespace-nowrap">{text}</span>
    </button>
  );
}

function SearchInput({
  icon,
  placeholder,
  value,
  onChange,
  subtitle,
  type = "text",
}: any) {
  return (
    <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer h-full">
      <div className="flex items-center space-x-2">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500 truncate">{placeholder}</div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            className="font-semibold w-full bg-transparent outline-none"
            placeholder={placeholder}
          />
          <div className="text-xs text-gray-400 truncate">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
