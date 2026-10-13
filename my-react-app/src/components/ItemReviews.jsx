import React, { useState, useEffect } from 'react'
import axios from 'axios';

// ---------------------------------------------------------------------------
// DUMMY DATA — shaped like your Rating entity. Replace with real data later.
// Rating { ratingId, catalog, user, rating, comment, createdAt, updatedAt }
// NOTE: I assumed the Users object exposes `username`. Adjust getUserName()
// below if your field is named differently (e.g. firstName/lastName).
// ---------------------------------------------------------------------------
const DUMMY_RATINGS = [
  {
    ratingId: 1,
    catalog: { catalogId: 1 },
    user: { userId: 11, username: 'Maria Santos' },
    rating: 5,
    comment:
      'Exactly what I was hoping for. Arrived hot, portions were generous, and the flavor was spot on. Already planning to order it again this weekend.',
    createdAt: '2026-09-22T10:15:00Z',
    updatedAt: '2026-09-22T10:15:00Z',
  },
  {
    ratingId: 2,
    catalog: { catalogId: 1 },
    user: { userId: 12, username: 'Jon Dela Cruz' },
    rating: 4,
    comment:
      'Really good overall. I would have liked a little more sauce, but the quality is great and it was worth the price.',
    createdAt: '2026-09-14T08:40:00Z',
    updatedAt: '2026-09-16T12:05:00Z', // differs from createdAt -> shows "Edited"
  },
  {
    ratingId: 3,
    catalog: { catalogId: 1 },
    user: { userId: 13, username: 'Angela Reyes' },
    rating: 5,
    comment: 'Fresh, tasty, and the special instructions were followed perfectly.',
    createdAt: '2026-08-30T17:20:00Z',
    updatedAt: '2026-08-30T17:20:00Z',
  },
  {
    ratingId: 4,
    catalog: { catalogId: 1 },
    user: { userId: 14, username: 'Paolo Garcia' },
    rating: 3,
    comment: 'Decent, but it was a bit lukewarm by the time it got to me.',
    createdAt: '2026-08-12T19:05:00Z',
    updatedAt: '2026-08-12T19:05:00Z',
  },
  {
    ratingId: 5,
    catalog: { catalogId: 1 },
    user: { userId: 15, username: 'Liza Mendoza' },
    rating: 5,
    // comment is a plain optional String on the entity, so it can be empty
    comment: '',
    createdAt: '2026-07-29T09:00:00Z',
    updatedAt: '2026-07-29T09:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// DUMMY: pretend this is the logged-in user's id (matches Jon Dela Cruz above).
// Replace with localStorage.getItem('user_ID') or a prop later.
const CURRENT_USER_ID = 12;

// DUMMY: reviews per page. Replace with your backend page size later.
const PAGE_SIZE = 5;

// Builds [1, '…', 4, 5, 6, '…', 20] style lists so the control stays compact
const getPageNumbers = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push('ellipsis-' + n);
    result.push(n);
  });
  return result;
};

const getUserName = (user) => user?.username || 'Anonymous';

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatDate = (instant) =>
  instant
    ? new Date(instant).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

const wasEdited = (r) => r.updatedAt && r.createdAt && r.updatedAt !== r.createdAt;

// Derives the summary card from the list so it always matches the data
const buildSummary = (ratings) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });
  const total = ratings.length;
  const average = total ? ratings.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  return { average, total, distribution };
};

const StarIcon = ({ filled, className = 'h-4 w-4' }) => (
  <svg
    className={`${className} ${filled ? 'text-[#C98A2B]' : 'text-[#E7DCC9]'}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L10 14.9l-5.25 2.8 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
  </svg>
);

const Stars = ({ rating, className }) => (
  <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <StarIcon key={n} filled={n <= Math.round(rating)} className={className} />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ItemReviews = ({ catalogId }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const [ratings, setRatings] = useState([]);
  const summary = buildSummary(ratings);
  // UI-only toggles: which review is in edit mode / awaiting delete confirmation
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // UI-only pagination (1-based). Swap for server-side paging later.
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const startIndex = (page - 1) * PAGE_SIZE;
  const [totalElements, setTotalElements] = useState(0);
  const pageRatings = ratings;
  const user_ID = localStorage.getItem('user_ID')
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [error, setError] = useState("");
  const goToPage = (n) => {
    setEditingId(null);
    setDeletingId(null);
    setPage(Math.min(Math.max(n, 1), totalPages));
  };


  console.log("Review catalog ID", catalogId)
  const fetchReviews = async () => {
          try {
            const response = await axios.get(`${API_URL}/ratings/catalog/${catalogId}?page=${page}&size=${PAGE_SIZE}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log(response);
          setRatings(response.data.content);
          setTotalPages(response.data.totalPages - 1);
          setTotalElements(response.data.totalElements)
  
          } catch (error) {
            console.error("Error", error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
          
          }
        }

   useEffect(() => {
    if (catalogId) {
        fetchReviews();
    }
}, [catalogId, page]);


const [editComment, setEditComment] = useState('');
const [editRating, setEditRating] = useState(0);

const handleSubmitReview = async () => {
  try {

    const ratingPayload = {
      rating: newRating,
      comment: newComment
    }

    const response = await axios.post(`${API_URL}/ratings/catalog/${catalogId}?userId=${user_ID}`, ratingPayload, {
                  headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
      });

    console.log(response);

   setNewComment("");
   setNewRating(0)
  } catch (error) {
    console.log(error);
        if (error.response?.data === "Too many requests" || error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
          setRetryTime(retryAfter);
          setError("Too Many Requests");
          setShowRateLimitPopup(true);
        }
      
  }
};

console.log(editComment);
const handleUpdateReview = async (ratingId) => {
  try {

    const ratingPayload = {
      rating: editRating,
      comment: editComment
    }

    const response = await axios.put(`${API_URL}/ratings/${ratingId}?userId=${user_ID}`, ratingPayload, {
                  headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
      });

    console.log(response);

    setEditingId(0);
    setEditRating(0);
    setEditComment("");
  } catch (error) {
    console.log(error);
        if (error.response?.data === "Too many requests" || error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
          setRetryTime(retryAfter);
          setError("Too Many Requests");
          setShowRateLimitPopup(true);
        }
      
  }
};


const handleDeleteReview = async (ratingId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/ratings/${ratingId}?userId=${user_ID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(response);

    setDeletingId(null);
    fetchReviews();

  } catch (error) {
    console.log(error);

    if (
      error.response?.data === "Too many requests" ||
      error.response?.status === 429
    ) {
      const retryAfter =
        parseInt(error.response.headers["retry-after"], 10) || 5;

      setRetryTime(retryAfter);
      setError("Too Many Requests");
      setShowRateLimitPopup(true);
    }
  }
};

console.log("Reviews: ", ratings);


console.log("Ratings length: ",ratings.length);

console.log("")
  return (
    <section className="mx-auto mb-12 w-full max-w-5xl px-4">
      <div className="rounded-2xl border border-[#E7DCC9] bg-white p-8 shadow-lg lg:p-12">
        <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-[#3B2A20] sm:text-3xl">
          Customer reviews
        </h2>

        {/* Summary */}
        <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
          <div className="flex flex-col items-start gap-2 md:items-center md:border-r md:border-[#E7DCC9] md:pr-8">
            <p className="font-['Fraunces',serif] text-5xl font-semibold text-[#3B2A20]">
              {summary.average.toFixed(1)}
            </p>
            <Stars rating={summary.average} className="h-5 w-5" />
            <p className="text-sm text-[#8A7862]">
              Based on {summary.total} review{summary.total === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = summary.total ? (count / summary.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 shrink-0 text-[#6B5745]">{star} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1E8D9]">
                    <div className="h-full rounded-full bg-[#A65A34]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[#8A7862]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="my-8 border-[#E7DCC9]" />

        {/* Write a review  ->  maps to Rating.rating (1-5) + Rating.comment */}
        <div className="rounded-xl border border-[#E7DCC9] bg-[#FBF6EE] p-5 sm:p-6">
          <h3 className="text-base font-semibold text-[#3B2A20]">Write a review</h3>
          <p className="mt-1 text-sm text-[#8A7862]">Tell others what you thought of this item.</p>

          <div className="mt-4 flex items-center gap-1" aria-label="Choose a rating from 1 to 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNewRating(n)}
                className="cursor-pointer rounded p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A65A34]/40"
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
              >
                <StarIcon filled={n <= newRating} className="h-7 w-7" />
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label htmlFor="review_comment" className="text-sm font-medium text-[#3B2A20]">
              Comment <span className="font-normal text-[#8A7862]">(optional)</span>
            </label>
            <span className="text-xs text-[#8A7862]">0/500</span>
          </div>
          <textarea
            id="review_comment"
            name="review_comment"
            rows="4"
            maxLength={500}
             onChange={(e) => setNewComment(e.target.value)}
            placeholder="What did you like or dislike? How was the taste and portion?"
            className="mt-2 w-full resize-none rounded-lg border border-[#E7DCC9] bg-white p-3 text-sm text-[#3B2A20] placeholder-[#8A7862]/60 focus:border-[#A65A34] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => handleSubmitReview()}
              className="cursor-pointer rounded-lg bg-[#A65A34] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[#8B4A2A] active:scale-[0.98]"
            >
              Submit review
            </button>
          </div>
        </div>

        {/* Review list */}
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#3B2A20]">All reviews</h3>
          <select
            className="cursor-pointer rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] px-3 py-2 text-sm text-[#3B2A20] focus:border-[#A65A34] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
            defaultValue="newest"
            aria-label="Sort reviews"
          >
            <option value="newest">Newest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>

        {ratings.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8A7862]">
            No reviews yet. Be the first to review this item.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[#E7DCC9]">
            {pageRatings.map((r) => {

          
            
              const name = getUserName(r.user);
              const isOwn = r.userId === Number(user_ID)
              const isEditing = editingId === r.ratingId;
              const isDeleting = deletingId === r.ratingId;
              return (
                <li key={r.ratingId} className="flex gap-4 py-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8A9A5B]/20 text-sm font-semibold text-[#5C6B3B]">
                    {getInitials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <p className="text-sm font-semibold text-[#3B2A20]">{name}</p>
                        {isOwn && (
                          <span className="rounded-full bg-[#A65A34]/10 px-2 py-0.5 text-xs font-medium text-[#A65A34]">
                            Your review
                          </span>
                        )}
                      </div>

                      {isOwn && !isEditing && !isDeleting && (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                             onClick={() => {
                            setEditingId(r.ratingId);
                            setEditRating(r.rating);
                            setEditComment(r.comment || '');
                          }}
                            className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-[#6B5745] transition-colors duration-150 hover:bg-[#A65A34]/10 hover:text-[#3B2A20]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(r.ratingId)}
                            className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3 rounded-xl border border-[#E7DCC9] bg-[#FBF6EE] p-4">
                        <div className="flex items-center gap-1" aria-label="Edit your rating">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setEditRating(n)}
                                className="cursor-pointer rounded p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A65A34]/40"
                                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                              >
                              <StarIcon filled={n <= r.rating} className="h-6 w-6" />
                            </button>
                          ))}
                        </div>
                        <textarea
                            rows="3"
                            maxLength={500}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="mt-3 w-full resize-none rounded-lg border border-[#E7DCC9] bg-white p-3 text-sm text-[#3B2A20] focus:border-[#A65A34] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
                          />
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="cursor-pointer rounded-lg border border-[#E7DCC9] px-4 py-2 text-sm font-medium text-[#6B5745] transition-colors duration-150 hover:bg-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateReview(r.ratingId)}
                            className="cursor-pointer rounded-lg bg-[#A65A34] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ease-out hover:bg-[#8B4A2A] active:scale-[0.98]"
                          >
                            Save changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <Stars rating={r.rating} className="h-4 w-4" />
                          <span className="text-xs text-[#8A7862]">{formatDate(r.createdAt)}</span>
                          {wasEdited(r) && (
                            <span className="rounded-full bg-[#F1E8D9] px-2 py-0.5 text-xs text-[#8A7862]">
                              Edited
                            </span>
                          )}
                        </div>

                        {r.comment && (
                          <p className="mt-3 text-sm leading-relaxed text-[#6B5745]">{r.comment}</p>
                        )}
                      </>
                    )}

                    {isDeleting && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">Delete this review? This can't be undone.</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-[#6B5745] transition-colors duration-150 hover:bg-red-50"
                          >
                            Keep review
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.ratingId)}
                            className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-red-700"
                          >
                            Delete review
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalElements > PAGE_SIZE && (
          <nav
            className="mt-4 flex flex-col items-center gap-3 border-t border-[#E7DCC9] pt-6 sm:flex-row sm:justify-between"
            aria-label="Reviews pagination"
          >
            <p className="text-sm text-[#8A7862]">
              Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, ratings.length)} of {ratings.length} reviews
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#E7DCC9] px-3 text-sm font-medium text-[#6B5745] transition-colors duration-150 hover:bg-[#A65A34]/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Previous
              </button>

              {getPageNumbers(page, totalPages).map((n) =>
                typeof n === 'string' ? (
                  <span key={n} className="px-1.5 text-sm text-[#8A7862]" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goToPage(n)}
                    aria-current={n === page ? 'page' : undefined}
                    className={`h-9 min-w-9 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                      n === page
                        ? 'bg-[#A65A34] text-white shadow-sm'
                        : 'text-[#6B5745] hover:bg-[#A65A34]/10'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#E7DCC9] px-3 text-sm font-medium text-[#6B5745] transition-colors duration-150 hover:bg-[#A65A34]/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </section>
  );
};

export default ItemReviews