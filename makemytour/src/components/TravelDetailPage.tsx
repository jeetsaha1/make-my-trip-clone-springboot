import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  ArrowRight,
  BedDouble,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  CreditCard,
  Home,
  MapPin,
  Plane,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Train,
  Umbrella,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import ReviewSection from "@/components/ReviewSection";
import SignupDialog from "@/components/SignupDialog";
import { getCollection, getCollectionItemById } from "@/api";
import { bookGenericExperience } from "@/api";
import LiveFlightStatus from "@/components/LiveFlightStatus";
import SeatMap from "@/components/SeatMap";
import RoomSelection from "@/components/RoomSelection";
import PriceGraph from "@/components/PriceGraph";
import Recommendations from "@/components/Recommendations";
import { setUser } from "@/store";

interface TravelDetailPageProps {
  collectionName: string;
  itemId?: string;
  pageTitle: string;
  detailType: "stay" | "transport" | "package" | "currency" | "insurance";
  entityType: "hotel" | "flight";
}

const TravelDetailPage = ({
  collectionName,
  itemId,
  pageTitle,
  detailType,
  entityType,
}: TravelDetailPageProps) => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  const normalizeToken = (value: any) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const extractAnyId = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      if (typeof value.$oid === "string") return value.$oid;
      if (typeof value.$id === "string") return value.$id;
      if (typeof value.oid === "string") return value.oid;
      if (typeof value.id === "string") return value.id;
      if (typeof value.toHexString === "function") {
        try {
          const hex = value.toHexString();
          if (hex) return hex;
        } catch (e) {}
      }
      if (typeof value.toString === "function") {
        try {
          const text = value.toString();
          if (text && text !== "[object Object]") return text;
        } catch (e) {}
      }
    }
    return "";
  };

  const resolveByFields = (collection: any[], token: string) => {
    const normalizedToken = normalizeToken(decodeURIComponent(token || ""));
    if (!normalizedToken) return null;

    return collection.find((entry: any) => {
      const candidates = [
        extractAnyId(entry.id),
        extractAnyId(entry._id),
        entry.slug,
        entry.uuid,
        entry.guid,
        entry.itemId,
        entry.name,
        entry.title,
        entry.hotelName,
        entry.packageName,
        entry.trainName,
        entry.busName,
        entry.cabType,
        entry.currency,
        entry.planName,
        entry.location,
        entry.destination,
        entry.city,
        entry.from && entry.to ? `${entry.from} ${entry.to}` : "",
      ]
        .filter(Boolean)
        .map(normalizeToken);

      return candidates.includes(normalizedToken) || candidates.some((candidate) => candidate.includes(normalizedToken) || normalizedToken.includes(candidate));
    }) || null;
  };

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        let result = await getCollectionItemById(collectionName, itemId);
        if (!result) {
          const collection = await getCollection(collectionName);
          if (Array.isArray(collection)) {
            result = collection.find((entry: any) => {
              const ids = [
                extractAnyId(entry.id),
                extractAnyId(entry._id),
                extractAnyId(entry.slug),
                extractAnyId(entry.uuid),
                extractAnyId(entry.guid),
                extractAnyId(entry.itemId),
              ].filter(Boolean);

              if (ids.includes(String(itemId))) {
                return true;
              }

              return resolveByFields([entry], String(itemId)) !== null;
            }) || resolveByFields(collection, String(itemId));
          }
        }
        setItem(result);
      } catch (error) {
        console.error("Failed to load travel item", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [collectionName, itemId]);

  const title = useMemo(() => {
    if (!item) return pageTitle;
    return (
      item.hotelName ||
      item.packageName ||
      item.trainName ||
      item.busName ||
      item.cabType ||
      item.currency ||
      item.planName ||
      item.name ||
      item.title ||
      pageTitle
    );
  }, [item, pageTitle]);

  const location = useMemo(() => {
    if (!item) return "";
    if (item.location) return item.location;
    if (item.destination) return item.destination;
    if (item.city) return item.city;
    if (item.from && item.to) return `${item.from} → ${item.to}`;
    return "";
  }, [item]);

  const priceValue = useMemo(() => {
    if (!item) return 0;
    return Number(item.pricePerNight || item.price || item.pricePerKm || item.premium || item.buyRate || item.sellRate || 0);
  }, [item]);

  const images = useMemo(() => {
    if (!item) return [] as string[];
    const candidates: any = item.images || item.pictures || item.photos || item.imageUrls || item.gallery || item.imageUrl || item.image;
    if (!candidates) return [];
    if (typeof candidates === "string") return [candidates];
    if (Array.isArray(candidates)) return candidates.filter(Boolean).map(String);
    return [];
  }, [item]);

  const priceLabel = useMemo(() => {
    if (detailType === "currency") {
      return `₹${Number(item?.buyRate || 0).toFixed(2)} / ${item?.currency || "INR"}`;
    }
    if (detailType === "insurance") {
      return `₹${Number(item?.premium || 0).toFixed(2)} premium`;
    }
    if (detailType === "stay") {
      return `₹${Number(item?.pricePerNight || 0)} / night`;
    }
    if (detailType === "transport") {
      return `₹${Number(item?.price || 0)} per seat`;
    }
    if (detailType === "package") {
      return `₹${Number(item?.price || 0)} package`;
    }
    return `₹${Number(priceValue || 0)}`;
  }, [detailType, item, priceValue]);

  const features = useMemo(() => {
    if (!item) return [];

    if (detailType === "stay") {
      return [
        item.amenities || "Premium amenities and concierge services",
        `${item.availableRooms || 0} rooms available`,
        `${item.location || "City center"} access`,
      ];
    }

    if (detailType === "transport") {
      if (collectionName === "cabs" || item.cabType) {
        const pickup = item.city || item.from || item.pickupLocation || "Unknown pickup";
        const drop = item.to || item.dropLocation || item.destination || null;
        return [
          `Price per km: ₹${item.pricePerKm ?? item.price ?? "N/A"}`,
          item.available ? "Available now" : "Availability may vary",
          drop ? `Route: ${pickup} → ${drop}` : `Pickup: ${pickup} (drop not provided)`,
        ];
      }
      return [
        item.availableSeats ? `${item.availableSeats} seats left` : "Flexible travel options",
        item.departureTime ? `Departs ${item.departureTime}` : "Convenient travel schedules",
        item.arrivalTime ? `Arrives ${item.arrivalTime}` : "Comfort-first experience",
      ];
    }

    if (detailType === "package") {
      return [
        item.duration ? `${item.duration} package` : "Custom holiday plans",
        item.destination ? `Destination: ${item.destination}` : "Memorable destinations",
        item.inclusions || "Meals, transfers, and curated experiences",
      ];
    }

    if (detailType === "currency") {
      return [
        `Buy rate: ${item?.buyRate || "N/A"}`,
        `Sell rate: ${item?.sellRate || "N/A"}`,
        `${item?.currency || "INR"} exchange support`,
      ];
    }

    if (detailType === "insurance") {
      return [
        `Coverage: ${item?.coverage || "Flexible plans"}`,
        `Policy type: ${item?.planName || "Travel coverage"}`,
        item?.deductible ? `Deductible: ${item.deductible}` : "Instant claim support",
      ];
    }

    return [];
  }, [detailType, item]);

  const overviewText = useMemo(() => {
    if (!item) return "";
    if (detailType === "stay") {
      return item.description || "Enjoy a comfortable stay with modern amenities, local experiences, and round-the-clock support.";
    }

    if (detailType === "transport") {
      return item.description || "A seamless journey designed for comfort, punctuality, and value-packed convenience.";
    }

    if (detailType === "package") {
      return item.description || "Explore a hand-crafted holiday experience with curated stays, transfers, and exciting activities.";
    }

    if (detailType === "currency") {
      return item.description || "Secure, competitive exchange rates for your international travel needs.";
    }

    if (detailType === "insurance") {
      return item.description || "Reliable travel protection with coverage for delays, cancellations, and emergency travel needs.";
    }

    return "";
  }, [detailType, item]);

  const detailCards = useMemo(() => {
    if (!item) return [];
    const cards: Array<{ label: string; value: string }> = [];

    if (detailType === "stay") {
      cards.push({ label: "Location", value: location || item.location || "City center" });
      cards.push({ label: "Check-in", value: item.checkin || "Flexible" });
      cards.push({ label: "Amenities", value: item.amenities || "Premium amenities" });
    } else if (detailType === "transport") {
      const pickup = item.city || item.from || item.pickupLocation || "From";
      const drop = item.to || item.destination || item.dropLocation || "To";
      cards.push({ label: "Route", value: item.cabType ? `${pickup} → ${drop === 'To' ? 'Not specified' : drop}` : `${item.from || "From"} → ${item.to || "To"}` });
      cards.push({ label: "Departure", value: item.departureTime || item.date || item.travelDate || "Flexible" });
      cards.push({ label: "Arrival", value: item.arrivalTime || item.travelDate || "Flexible" });
    } else if (detailType === "package") {
      cards.push({ label: "Destination", value: item.destination || location || "India" });
      cards.push({ label: "Duration", value: item.duration || "Flexible" });
      cards.push({ label: "Highlights", value: item.highlights || "Curated experiences" });
    } else if (detailType === "currency") {
      cards.push({ label: "Currency", value: item.currency || "INR" });
      cards.push({ label: "Buy Rate", value: item.buyRate || "N/A" });
      cards.push({ label: "Sell Rate", value: item.sellRate || "N/A" });
    } else if (detailType === "insurance") {
      cards.push({ label: "Policy", value: item.planName || "Travel protection" });
      cards.push({ label: "Coverage", value: item.coverage || "Flexible coverage" });
      cards.push({ label: "Premium", value: `₹${item.premium || 0}` });
    }

    return cards;
  }, [detailType, item, location]);

  const maxQuantity = Number(item?.availableSeats || item?.availableRooms || 6) || 6;

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    setQuantity(Number.isNaN(value) ? 1 : Math.max(1, Math.min(value, maxQuantity)));
  };

  const handleBooking = async () => {
    if (!user) {
      setOpen(false);
      return;
    }

    try {
      const booking = await bookGenericExperience({
        userId: user?.id || user?._id,
        type: pageTitle,
        referenceId: String(item?.id || item?._id || item?.slug || item?.name || item?.title || ""),
        referenceName: title,
        collectionName,
        location: location || item?.city || item?.destination || "",
        travelDate: item?.travelDate || item?.departureTime || item?.date || "",
        startDate: item?.startDate || "",
        endDate: item?.endDate || "",
        notes: overviewText,
        quantity,
        price: Number(priceValue * quantity),
      });

      const nextUser = {
        ...user,
        bookings: [...(user?.bookings || []), booking],
      };

      dispatch(setUser(nextUser));
      setOpen(false);
      router.push("/profile");
    } catch (error) {
      console.error("Failed to book generic experience", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold">No details available for this selection.</h1>
          <p className="mt-3 text-gray-600">Please return to the search page and try another option.</p>
          <Link href="/" className="mt-6 inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const heroIcon =
    detailType === "stay" ? <Home className="h-6 w-6" /> :
    detailType === "transport" ? <Plane className="h-6 w-6" /> :
    detailType === "package" ? <Umbrella className="h-6 w-6" /> :
    detailType === "currency" ? <CreditCard className="h-6 w-6" /> :
    <Shield className="h-6 w-6" />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-6 py-8 text-white md:px-10 md:py-10">
            <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.25em] text-blue-100">
              <span className="rounded-full bg-white/20 px-3 py-1">{pageTitle}</span>
              <span className="rounded-full bg-white/20 px-3 py-1">{collectionName}</span>
            </div>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm">
                  {heroIcon}
                  {detailType === "stay" ? "Stay" : detailType === "transport" ? "Travel" : detailType === "package" ? "Holiday" : detailType === "currency" ? "Forex" : "Insurance"}
                </div>
                <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
                <p className="mt-2 max-w-2xl text-lg text-blue-50">{location || "Curated for comfort and convenience."}</p>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/20 px-5 py-4 backdrop-blur">
                <p className="text-sm text-blue-100">Starting from</p>
                <p className="text-3xl font-semibold">{priceLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              {images.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.35fr]">
                    <div className="rounded-lg overflow-hidden">
                      <img src={images[0]} alt={title} className="w-full h-72 object-cover" />
                    </div>
                    <div className="grid gap-2">
                      {images.slice(1, 5).map((img, i) => (
                        <div key={i} className="rounded-lg overflow-hidden">
                          <img src={img} alt={`${title}-${i}`} className="w-full h-20 object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Flight-specific live status */}
              {collectionName === 'flights' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <LiveFlightStatus flightId={String(item?.id || item?._id || item?.flightId || '')} />
                </section>
              )}

              {/* Flight and bus seat allocation */}
              {(collectionName === 'flights' || collectionName === 'buses') && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <SeatMap flightId={String(item?.id || item?._id || item?.flightId || item?.busId || '')} />
                </section>
              )}

              {/* Stay-specific: room selection and price history */}
              {detailType === 'stay' && (
                <>
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <RoomSelection hotelId={String(item?.id || item?._id || '')} images={images} />
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-6">
                    <PriceGraph id={String(item?.id || item?._id || '')} />
                  </section>
                </>
              )}
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Overview</h2>
                </div>
                <p className="mt-4 text-gray-700">{overviewText}</p>
              </section>

              <section className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold">Key features</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {features.map((feature, index) => (
                    <div key={`${feature}-${index}`} className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold">Why it stands out</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {detailCards.map((card) => (
                    <div key={card.label} className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="mt-2 text-sm text-slate-700">{card.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Book this experience</p>
                    <p className="text-3xl font-semibold">{priceLabel}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <Ticket className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {detailType === 'transport' && (collectionName === 'cabs' || item?.cabType) ? (
                      <div>
                        <div className="text-sm">Pickup: {item?.city || item?.from || item?.pickupLocation || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">Drop: {item?.to || item?.dropLocation || item?.destination ? (item?.to || item?.dropLocation || item?.destination) : 'Not provided'}</div>
                      </div>
                    ) : (
                      <span>{location || "Flexible destination"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Instant confirmation and flexible options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Travelers can manage their plans from the profile area</span>
                  </div>
                </div>

                <div className="mt-6">
                  {user ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">Reserve now</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white sm:max-w-[560px]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-semibold">Confirm your booking</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 grid gap-4">
                          {images.length > 0 && (
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-sm text-slate-500">Recent images</p>
                              <div className="mt-2 flex gap-2">
                                {images.slice(-3).map((img, idx) => (
                                  <img key={idx} src={img} alt={`img-${idx}`} className="h-16 w-24 object-cover rounded-md" />
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Selected plan</p>
                            <p className="text-lg font-semibold">{title}</p>
                            {detailType === 'transport' && (collectionName === 'cabs' || item?.cabType) ? (
                              <div className="text-sm text-slate-600">
                                <div>Pickup: {item?.city || item?.from || item?.pickupLocation || 'Unknown'}</div>
                                <div>Drop: {item?.to || item?.dropLocation || item?.destination ? (item?.to || item?.dropLocation || item?.destination) : 'Not provided'}</div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-600">{location}</p>
                            )}
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input id="quantity" type="number" min="1" max={maxQuantity} value={quantity} onChange={handleQuantityChange} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="guestName">Traveler</Label>
                              <Input id="guestName" value={user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Guest"} readOnly />
                            </div>
                          </div>
                          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            Total estimate: <span className="font-semibold">₹{Number(priceValue * quantity).toLocaleString()}</span>
                          </div>
                          <Button onClick={handleBooking}>Complete booking</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <SignupDialog
                      trigger={<Button className="w-full">Reserve now</Button>}
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <Star className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Traveler perks</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" /> Instant access to itinerary and booking summary</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" /> Flexible support and real-time updates</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" /> Secure checkout and account-based bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Recommendations userKey={user?.email || user?.id || ''} />
        </div>

        <ReviewSection entityType={entityType} entityId={itemId || ""} user={user} />
      </div>
    </div>
  );
};

export default TravelDetailPage;
