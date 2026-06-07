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

  const handleSave = async () => {
    try {
      const data = await editprofile(
        user?.id,
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
    return new Date(dateString).toLocaleDateString("en-IN", {
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
    if (!user?.id || !booking?.bookingId) {
      return;
    }
    try {
      setCancelLoading(true);
      const data = await cancelBooking(user.id, booking.bookingId, booking.type, cancelReason);
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
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
              <div className="space-y-6">
                {user?.bookings.map((booking: any, index: any) => (
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
                          <h3 className="font-semibold">{booking?.type}</h3>
                          <p className="text-sm text-gray-500">
                            Booking ID: {booking?.bookingId}
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
                        <span>{booking?.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4" />
                        <span>{booking?.bookingStatus || "Confirmed"}</span>
                      </div>
                    </div>
                    {booking?.bookingStatus === "Cancelled" ? (
                      <div className="rounded-lg bg-red-50 p-4 mb-4 text-sm text-red-700">
                        <p className="font-semibold">Refund Status: {booking?.refundStatus}</p>
                        <p>Amount: ₹ {booking?.refundAmount?.toLocaleString("en-IN")}</p>
                        <p>Reason: {booking?.refundReason}</p>
                        <p>Timeline: {booking?.refundTimeline}</p>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
