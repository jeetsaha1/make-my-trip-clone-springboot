import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Edit2,
  MapPin,
  Calendar,
  CreditCard,
  X,
  Check,
  LogOut,
  Plane,
  Building2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { clearUser, setUser } from "@/store";
import { cancelBooking, editprofile } from "@/api";
import LiveFlightStatus from "@/components/LiveFlightStatus";
const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [cancellationBookingId, setCancellationBookingId] = useState("");
  const [cancelReason, setCancelReason] = useState("Change of plans");
  const [cancelLoading, setCancelLoading] = useState(false);
  const cancellationReasons = [
    "Change of plans",
    "Found a better price",
    "Travel date changed",
    "Personal reasons",
    "Other",
  ];
  const refundPolicySteps = [
    { label: "Pending", description: "Refund request is received and queued" },
    { label: "Processed", description: "Payment provider has started the transfer" },
    { label: "Completed", description: "Refund is reflected in the original payment method" },
  ];

  const parseBookingDate = (dateString: string) => {
    const parsed = new Date(dateString);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const estimateRefundAmount = (booking: any) => {
    const bookedAt = parseBookingDate(booking?.date);
    const totalPrice = Number(booking?.totalPrice || 0);
    if (!bookedAt || !totalPrice) {
      return 0;
    }

    const hoursPassed = (Date.now() - bookedAt.getTime()) / (1000 * 60 * 60);
    if (hoursPassed <= 24) {
      return Math.round(totalPrice * 0.5);
    }
    if (hoursPassed <= 72) {
      return Math.round(totalPrice * 0.25);
    }
    return 0;
  };

  const getRefundStageIndex = (booking: any) => {
    const status = String(booking?.refundStatus || "Pending").toLowerCase();
    if (status === "completed") return 2;
    if (status === "processed") return 1;
    return 0;
  };

  const getRefundStatusTone = (status: string | undefined) => {
    const value = String(status || "Pending").toLowerCase();
    if (value === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (value === "processed") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const trackedFlightIds: string[] = Array.from(
    new Set<string>(
      (user?.bookings || [])
        .filter((booking: any) => String(booking?.type || "").toLowerCase() === "flight" && booking?.referenceId)
        .map((booking: any) => String(booking.referenceId))
        .filter(Boolean)
    )
  );

  React.useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const getUserId = () => user?.id || user?._id;

  const handleSave = async () => {
    try {
      const data = await editprofile(
        getUserId(),
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.phoneNumber
      );
      dispatch(setUser(data));
      setIsEditing(false);
    } catch (error) {
      if (user) {
        setUserData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });
      }
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
      return dateString || "-";
    }
    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handleEditFormChange = (field:any, value:any) => {
    setUserData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleCancellation = async (booking: any) => {
    const userId = getUserId();
    if (!userId || !booking?.bookingId) {
      return;
    }
    try {
      setCancelLoading(true);
      const data = await cancelBooking(userId, booking.bookingId, booking.type, cancelReason);
      dispatch(setUser(data));
      setCancellationBookingId("");
    } catch (error) {
      console.error(error);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Profile</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-600 flex items-center space-x-1 hover:text-red-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => handleEditFormChange("firstName", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => handleEditFormChange("lastName", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleEditFormChange("email", e.target.value)}
                      
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userData.phoneNumber}
                      onChange={(e) => handleEditFormChange("phoneNumber", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          setUserData({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            email: user.email || "",
                            phoneNumber: user.phoneNumber || "",
                          });
                        }
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      {/* <p className="text-sm text-gray-500">{userData.role}</p> */}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <p>{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <p>{user?.phoneNumber}</p>
                  </div>
                  <button
                    className="w-full mt-4 flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">Cancellation policy</p>
                    <p className="mt-1 text-sm text-gray-600">Cancel directly from this dashboard and get an automatic refund estimate before you confirm.</p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      <li>50% refund if canceled within 24 hours of booking.</li>
                      <li>25% refund if canceled within 72 hours of booking.</li>
                      <li>Refund status moves from Pending to Processed to Completed.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
              {trackedFlightIds.length > 0 && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <LiveFlightStatus flightId={trackedFlightIds} />
                </div>
              )}
              <div className="space-y-6">
                {user?.bookings?.length ? user.bookings.map((booking: any, index: any) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {booking?.type === "Flight" ? (
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Plane className="w-6 h-6 text-blue-600" />
                          </div>
                        ) : (
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Building2 className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{booking?.referenceName || booking?.type}</h3>
                          <p className="text-sm text-gray-500">
                            Booking ID: {booking?.bookingId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking?.bookingStatus || "Confirmed"} • {booking?.collectionName || booking?.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹ {booking?.totalPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-gray-500">{booking?.type}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking?.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking?.location || booking?.startDate || booking?.travelDate || booking?.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4" />
                        <span>{booking?.bookingStatus || "Confirmed"}</span>
                      </div>
                    </div>
                    {(booking?.startDate || booking?.endDate || booking?.travelDate || booking?.notes) && (
                      <div className="rounded-lg bg-gray-50 p-4 mb-4 text-sm text-gray-700 space-y-1">
                        {booking?.startDate && <p>Start Date: {formatDate(booking.startDate)}</p>}
                        {booking?.endDate && <p>End Date: {formatDate(booking.endDate)}</p>}
                        {booking?.travelDate && <p>Travel Date: {formatDate(booking.travelDate)}</p>}
                        {booking?.referenceId && <p>Reference: {booking.referenceId}</p>}
                        {booking?.notes && <p>{booking.notes}</p>}
                      </div>
                    )}
                    {booking?.bookingStatus === "Cancelled" ? (
                      <div className="rounded-lg bg-red-50 p-4 mb-4 text-sm text-red-700 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRefundStatusTone(booking?.refundStatus)}`}>
                            Refund {booking?.refundStatus || "Pending"}
                          </span>
                          <span className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700">
                            {booking?.cancellationReason || booking?.refundReason || "Customer request"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div className="rounded-lg bg-white p-3 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Refund amount</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              ₹ {(booking?.refundAmount || 0).toLocaleString("en-IN")}
                            </p>
                            {booking?.refundAmount < booking?.totalPrice ? (
                              <p className="text-xs text-gray-500">Partial refund applied based on the policy window.</p>
                            ) : (
                              <p className="text-xs text-gray-500">Full eligible refund has been calculated.</p>
                            )}
                          </div>
                          <div className="rounded-lg bg-white p-3 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Expected timeline</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{booking?.refundTimeline || "3-5 business days"}</p>
                            <p className="text-xs text-gray-500">Refunds usually follow bank/payment gateway processing windows.</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Submitted on</p>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{booking?.cancellationDate ? formatDate(booking.cancellationDate) : "Recently"}</p>
                            <p className="text-xs text-gray-500">Reason recorded for trend analysis.</p>
                          </div>
                        </div>
                        <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">Refund status tracker</p>
                            <p className="text-xs text-gray-500">Live updates will appear here</p>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            {refundPolicySteps.map((step, index) => {
                              const stageIndex = getRefundStageIndex(booking);
                              const isActive = index <= stageIndex;
                              return (
                                <div key={step.label} className={`rounded-xl border p-3 ${isActive ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-900">{step.label}</p>
                                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-red-500" : "bg-gray-300"}`} />
                                  </div>
                                  <p className="mt-2 text-xs text-gray-600">{step.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {booking?.bookingStatus !== "Cancelled" ? (
                      <div className="space-y-3">
                        {cancellationBookingId === booking?.bookingId ? (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Select cancellation reason
                            </label>
                            <select
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                              {cancellationReasons.map((reason) => (
                                <option key={reason} value={reason}>
                                  {reason}
                                </option>
                              ))}
                            </select>
                            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                              <p className="font-semibold">Refund preview</p>
                              <p className="mt-1">Estimated refund: ₹ {estimateRefundAmount(booking).toLocaleString("en-IN")}</p>
                              <p>Policy: 50% within 24 hours, 25% within 72 hours, otherwise not eligible.</p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                disabled={cancelLoading}
                                onClick={() => handleCancellation(booking)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                              >
                                {cancelLoading ? "Processing..." : "Submit Cancellation"}
                              </button>
                              <button
                                disabled={cancelLoading}
                                onClick={() => setCancellationBookingId("")}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setCancellationBookingId(booking?.bookingId || "");
                              setCancelReason("Change of plans");
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" />
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                    No bookings yet. Your reserved homestays, holidays, trains, buses, cabs, forex, and insurance will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
