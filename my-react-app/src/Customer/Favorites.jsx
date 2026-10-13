import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../components/CustomerHeader.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

const Favorites = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const user_ID = localStorage.getItem('user_ID');
  const token = localStorage.getItem('jwtToken');

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState('');

  const handleRateLimit = (err) => {
    if (err.response?.data === 'Too many requests' || err.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'], 10) || 5;
      setRetryTime(retryAfter);
      setError('Too Many Requests');
      setShowRateLimitPopup(true);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_URL}/favorites/user/${user_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setFavorites(response.data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      handleRateLimit(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (catalogId) => {
    try {
      await axios.delete(`${API_URL}/favorites/catalog/${catalogId}?userId=${user_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Drop it from the list right away
      setFavorites((prev) => prev.filter((fav) => (fav.catalog ?? fav).catalogId !== catalogId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      handleRateLimit(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4">
        <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#3B2A20] sm:text-4xl">
          My Favorites
        </h1>
        <div className="mt-3 h-1 w-14 rounded-full bg-[#A65A34]" />
        <p className="mt-3 max-w-xl text-sm text-[#8A7862] sm:text-base">
          The dishes you've saved, all in one place.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {showRateLimitPopup && (
          <RateLimitPopup
            error={error}
            retryTime={retryTime}
            setRetryTime={setRetryTime}
            setShowPopup={setShowRateLimitPopup}
            showPopup={showRateLimitPopup}
            fetchData={fetchFavorites}
          />
        )}

        {isLoading && (
          <div className="flex items-center justify-center my-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
          </div>
        )}

        {!isLoading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A65A34]/10">
              <svg className="h-8 w-8 text-[#A65A34]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div>
            <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">No favorites yet</p>
            <p className="mt-1 text-sm text-[#8A7862]">Tap the heart on any dish to save it here.</p>
            <Link
              to="/"
              className="mt-5 rounded-full bg-[#A65A34] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#8B4A2A]"
            >
              Browse the menu
            </Link>
          </div>
        )}

        {!isLoading && favorites.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => {
              // Supports either a nested { catalog: {...} } response or a flat catalog-shaped one
              const item = fav.catalog ?? fav;
              const { catalogId, catalogName, catalog_price, catalog_image, available } = item;
              const isAvailable = available === undefined ? true : Boolean(available);

              return (
                <li
                  key={catalogId}
                  className="group relative overflow-hidden rounded-2xl border border-[#A65A34]/10 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  <Link to={`/food_details/${catalogId}`} className="relative block">
                    <img
                      src={`https://${bucket}.s3.${region}.amazonaws.com/${catalog_image}`}
                      alt={catalogName}
                      className={`h-50 w-full object-cover transition-transform duration-500 sm:h-60 ${
                        isAvailable ? 'group-hover:scale-105' : 'blur-sm scale-105'
                      }`}
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#3B2A20]/30">
                        <span className="rounded-full bg-[#3B2A20]/80 px-3 py-1 text-xs font-semibold text-[#F7F1E8] shadow-sm">
                          Currently Unavailable
                        </span>
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeFavorite(catalogId)}
                    aria-label="Remove from favorites"
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#A65A34] text-white shadow-sm transition-colors duration-150 hover:bg-[#8A4A2A]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </button>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#3B2A20]">{catalogName}</h3>
                    <p className="mt-1.5 text-sm font-medium text-[#A65A34]">PHP {catalog_price}</p>

                    <Link to={`/food_details/${catalogId}`} className="mt-4 block">
                      <button className="w-full cursor-pointer rounded-lg bg-[#A65A34] p-3 text-sm font-semibold text-[#F7F1E8] shadow-sm transition-colors duration-150 hover:bg-[#8A4A2A] hover:shadow-md">
                        View More
                      </button>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Favorites;