import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Flag, CheckCircle } from "lucide-react";
import { getReviews, getReviewSummary, postReview, postReviewReply, flagReview } from "@/api";

interface ReviewSectionProps {
  entityType: "hotel" | "flight";
  entityId: string;
  user: any;
}

interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: Record<number, number>;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "mostHelpful", label: "Most Helpful" },
  { value: "highestRated", label: "Highest Rated" },
];

const initialSummary: ReviewSummary = {
  averageRating: 0,
  reviewCount: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ReviewSection = ({ entityType, entityId, user }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>(initialSummary);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterStars, setFilterStars] = useState<number | "">("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async (sort = sortOrder, stars?: number) => {
    const response = await getReviews(entityType, entityId, sort, stars);
    setReviews(response || []);
  };

  const loadSummary = async () => {
    const response = await getReviewSummary(entityType, entityId);
    const formatted = {
      averageRating: Number(response.averageRating || 0),
      reviewCount: Number(response.reviewCount || 0),
      ratingBreakdown: response.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
    setSummary(formatted);
  };

  useEffect(() => {
    if (!entityId) return;
    loadReviews(sortOrder, typeof filterStars === "number" ? filterStars : undefined);
    loadSummary();
  }, [entityId]);

  useEffect(() => {
    if (!entityId) return;
    loadReviews(sortOrder, typeof filterStars === "number" ? filterStars : undefined);
  }, [sortOrder, filterStars]);

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
          setPhotoUrls((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReviewSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setSubmitting(true);
    try {
      await postReview({
        entityType,
        entityId,
        userId: user.id || user._id || "anonymous",
        userName: `${user.firstName || "Guest"} ${user.lastName || ""}`.trim() || "Guest",
        rating,
        title,
        text,
        photoUrls,
      });
      setRating(5);
      setTitle("");
      setText("");
      setPhotoPreviews([]);
      setPhotoUrls([]);
      await loadReviews(sortOrder, typeof filterStars === "number" ? filterStars : undefined);
      await loadSummary();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!user) {
      return;
    }
    const replyText = replyInputs[reviewId];
    if (!replyText) {
      return;
    }
    try {
      await postReviewReply(reviewId, {
        userId: user.id || user._id || "anonymous",
        userName: `${user.firstName || "Guest"} ${user.lastName || ""}`.trim() || "Guest",
        text: replyText,
      });
      setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
      loadReviews(sortOrder, typeof filterStars === "number" ? filterStars : undefined);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFlag = async (reviewId: string) => {
    if (!user) {
      return;
    }
    try {
      await flagReview(reviewId, user.id || user._id || "anonymous", "Inappropriate content");
      loadReviews(sortOrder, typeof filterStars === "number" ? filterStars : undefined);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section id="reviews" className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <p className="text-gray-600 mt-1">
            {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"} · {summary.averageRating.toFixed(1)} rating
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="min-w-[150px]">
            <Label htmlFor="review-sort" className="text-sm text-gray-500">
              Sort by
            </Label>
            <select
              id="review-sort"
              className="mt-1 w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <Label htmlFor="review-filter" className="text-sm text-gray-500">
              Filter stars
            </Label>
            <select
              id="review-filter"
              className="mt-1 w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm"
              value={filterStars}
              onChange={(e) => setFilterStars(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6 mb-8">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl font-bold text-blue-600">{summary.averageRating.toFixed(1)}</div>
            <div>
              <div className="text-sm text-gray-500">Average rating</div>
              <div className="text-sm text-gray-500">Based on {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"}</div>
            </div>
          </div>
          {([5, 4, 3, 2, 1] as const).map((star) => (
            <div key={star} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{star} Stars</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="font-semibold">{summary.ratingBreakdown[star] || 0}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">Write a review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating" className="text-sm text-gray-500">
                  Rating
                </Label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      aria-label={`${star} star`}
                      className={`rounded-full p-2 transition ${rating >= star ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      onClick={() => setRating(star)}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="reviewTitle" className="text-sm text-gray-500">
                  Review title
                </Label>
                <Input
                  id="reviewTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reviewText" className="text-sm text-gray-500">
                Review details
              </Label>
              <Textarea
                id="reviewText"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience in detail"
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="reviewPhotos" className="text-sm text-gray-500">
                Upload photos
              </Label>
              <Input id="reviewPhotos" type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
              {photoPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {photoPreviews.map((src, index) => (
                    <img key={index} src={src} alt={`Review preview ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={!user || submitting} className="w-full">
              {user ? "Submit review" : "Log in to review"}
            </Button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
            No reviews yet. Be the first to leave feedback.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id || review._id} className="rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                    {review.userName || "Anonymous"}
                    <span>•</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                    {Array.from({ length: review.rating || 0 }).map((_, index) => (
                      <Star key={index} className="w-4 h-4" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {review.helpfulCount || 0} found this helpful
                </div>
              </div>
              {review.title && <h3 className="text-lg font-semibold mb-2">{review.title}</h3>}
              <p className="text-gray-700 mb-4 whitespace-pre-line">{review.text}</p>
              {review.photoUrls?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {review.photoUrls.map((photo: string, index: number) => (
                    <img key={index} src={photo} alt={`Review image ${index + 1}`} className="h-32 w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500">
                <button type="button" onClick={() => handleFlag(review.id || review._id)} className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-100">
                  <Flag className="w-4 h-4" /> Flag
                </button>
                {review.flagCount > 0 && <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">Flagged by users</span>}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4 space-y-4">
                {review.replies?.map((reply: any) => (
                  <div key={reply.id || reply.userId} className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{reply.userName || "Moderator"}</span>
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-gray-700">{reply.text}</p>
                  </div>
                ))}
                {user && (
                  <div className="space-y-2">
                    <Label htmlFor={`reply-${review.id || review._id}`} className="text-sm text-gray-500">
                      Reply to this review
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id={`reply-${review.id || review._id}`}
                        value={replyInputs[review.id || review._id] || ""}
                        onChange={(e) => setReplyInputs((prev) => ({ ...prev, [review.id || review._id]: e.target.value }))}
                        placeholder="Write your reply"
                      />
                      <Button type="button" onClick={() => handleReplySubmit(review.id || review._id)}>
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
