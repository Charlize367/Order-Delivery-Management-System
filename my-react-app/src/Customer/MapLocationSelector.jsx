import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// MapLocationSelector
//
// Generic, reusable "pick a point on a map" input. Search an address, click
// anywhere on the map, drag the pin, or use the browser's geolocation — the
// component reports back { lat, lng, address } through onChange.
//
// Built to plug into anything that needs coordinates from a person, e.g. a
// checkout/delivery-address step (this is what would finally give
// TrackDriverLocation real destination_lat / destination_lang instead of
// falling back to "coordinates unavailable"), or an admin screen for
// setting a restaurant's location.
//
// Geocoding: uses OpenStreetMap's Nominatim (free, no API key) for the
// search box and reverse-geocoding the pin's address. Nominatim's usage
// policy caps public requests at ~1/sec and asks for a real user agent —
// fine for development, but for production traffic you should proxy these
// calls through your own backend (or a paid geocoder) rather than calling
// nominatim.openstreetmap.org directly from the browser at scale.
// ---------------------------------------------------------------------------

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Manila — swap for your default
const SEARCH_DEBOUNCE_MS = 500;

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const PIN_ICON = L.divIcon({
  className: 'mls-marker',
  html: `
    <div style="width:34px;height:34px;border-radius:9999px 9999px 9999px 0;transform:rotate(45deg);background:#A65A34;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(38,32,27,0.4);border:2px solid #fff;">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-45deg);">
        <circle cx="12" cy="9.5" r="2.3" />
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 30],
});

const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-3.6-3.6" />
  </svg>
);

const IconCrosshair = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5V5M12 19v2.5M21.5 12H19M5 12H2.5" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconMapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

// Captures clicks on the map and reports the lat/lng up.
const ClickToPlace = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Re-centers the map when the selected point changes from outside a click
// (search result, current-location button, or an initial `value` prop).
const RecenterOnSelect = ({ point }) => {
  const map = useMap();
  useEffect(() => {
    if (point) {
      map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point?.lat, point?.lng]);
  return null;
};

/**
 * @param {{lat:number,lng:number}} [value]   initial / controlled point
 * @param {(loc:{lat:number,lng:number,address:string}) => void} onChange
 *        fires on every selection (search pick, click, drag, current-location)
 *        if provided, a "Confirm location" button is shown and calls this
 * @param {number} [height=320]  map height in px
 */
const MapLocationSelector = ({ value, onChange, height = 320 }) => {
  const [point, setPoint] = useState(value ?? null);
  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchAbortRef = useRef(null);

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const reverseAbortRef = useRef(null);

  const reverseGeocode = useCallback(async (lat, lng) => {
    if (reverseAbortRef.current) reverseAbortRef.current.abort();
    const controller = new AbortController();
    reverseAbortRef.current = controller;

    setAddressLoading(true);
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`,
        { signal: controller.signal, headers: { Accept: 'application/json' } }
      );
      const data = await res.json();
      setAddress(data?.display_name ?? '');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[MapLocationSelector] Reverse geocode failed', err);
      }
    } finally {
      setAddressLoading(false);
    }
  }, []);

  const selectPoint = useCallback(
    (next, { skipReverseGeocode = false } = {}) => {
      setPoint(next);
      setGeoError('');
      if (!skipReverseGeocode) {
        reverseGeocode(next.lat, next.lng);
      }
    },
    [reverseGeocode]
  );

  // Report every confirmed selection to the parent.
  useEffect(() => {
    if (point && onChange) {
      onChange({ lat: point.lat, lng: point.lng, address });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point, address]);

  // Address search
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 3) {
      setResults([]);
      return;
    }

    if (searchAbortRef.current) searchAbortRef.current.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setSearching(true);
    fetch(
      `${NOMINATIM_BASE}/search?format=json&limit=5&q=${encodeURIComponent(debouncedQuery)}`,
      { signal: controller.signal, headers: { Accept: 'application/json' } }
    )
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('[MapLocationSelector] Search failed', err);
      })
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const handlePickResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setAddress(result.display_name);
    selectPoint({ lat, lng }, { skipReverseGeocode: true });
    setQuery(result.display_name);
    setShowResults(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support geolocation.");
      return;
    }
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        selectPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setGeoError(err.message || 'Could not get your location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const initialCenter = point ?? DEFAULT_CENTER;

  return (
    <div className="rounded-2xl border border-[#26201B]/8 bg-white p-6 shadow-[0_1px_2px_rgba(38,32,27,0.04)] sm:p-8">
      <h3 className="text-base font-semibold tracking-tight text-[#26201B]">Choose a location</h3>
      <p className="mt-1 text-sm text-[#26201B]/55">
        Search an address, drop the pin, or use your current location.
      </p>

      {/* Search box */}
      <div className="relative mt-4">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#26201B]/35" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search for an address…"
          className="w-full rounded-xl border border-[#26201B]/12 bg-[#F5F3EF] py-2.5 pl-10 pr-4 text-sm text-[#26201B] placeholder:text-[#26201B]/40 outline-none focus:border-[#A65A34]/50 focus:ring-2 focus:ring-[#A65A34]/15"
        />

        {showResults && (searching || results.length > 0) && (
          <div className="absolute z-[1000] mt-1.5 w-full overflow-hidden rounded-xl border border-[#26201B]/10 bg-white shadow-[0_4px_16px_rgba(38,32,27,0.12)]">
            {searching && (
              <div className="px-4 py-3 text-xs text-[#26201B]/45">Searching…</div>
            )}
            {!searching &&
              results.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handlePickResult(result)}
                  className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm text-[#26201B]/75 transition-colors hover:bg-[#F5F3EF]"
                >
                  <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A65A34]/70" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Current location button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#26201B]/12 bg-white px-3 py-1.5 text-xs font-medium text-[#26201B]/70 transition-colors hover:bg-[#F5F3EF] disabled:opacity-50"
      >
        <IconCrosshair className="h-3.5 w-3.5" />
        {locating ? 'Locating…' : 'Use my current location'}
      </button>
      {geoError && <p className="mt-1.5 text-xs text-[#B23A2E]">{geoError}</p>}

      {/* Map */}
      <div
        className="mt-4 overflow-hidden rounded-xl border border-[#26201B]/8"
        style={{ height }}
      >
        <MapContainer
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={point ? 15 : 12}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToPlace onPick={selectPoint} />
          <RecenterOnSelect point={point} />

          {point && (
            <Marker
              position={[point.lat, point.lng]}
              icon={PIN_ICON}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  selectPoint({ lat, lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Selected address readout */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F5F3EF] px-4 py-3">
        <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A65A34]" />
        <div className="min-w-0 flex-1">
          {point ? (
            <>
              <p className="truncate text-sm font-medium text-[#26201B]">
                {addressLoading ? 'Looking up address…' : address || 'Selected location'}
              </p>
              <p className="mt-0.5 text-xs text-[#26201B]/45">
                {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
              </p>
            </>
          ) : (
            <p className="text-sm text-[#26201B]/50">No location selected yet — click the map to drop a pin.</p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default MapLocationSelector;