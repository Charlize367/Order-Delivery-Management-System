import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// Straight-line distance / ETA helpers.
//
// There are no destination coordinates in the current order/delivery API
// response (only `order_address`, a plain string). This component accepts
// `destination_lat` / `destination_lang` as optional props so it works today
// (live status + location updates, no distance/ETA) and lights up distance
// + ETA automatically once the backend starts returning coordinates for the
// delivery destination — no changes needed here.
//
// ETA is a clearly-labeled *approximation* based on straight-line distance
// and an assumed average delivery speed, since there's no routing/ETA
// service in the project yet. Swap `estimateEtaMinutes` for a real
// road-distance call once one exists.
// ---------------------------------------------------------------------------

const AVG_DELIVERY_SPEED_KMH = 25;

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function estimateEtaMinutes(distanceKm) {
  if (distanceKm == null) return null;
  return Math.max(1, Math.round((distanceKm / AVG_DELIVERY_SPEED_KMH) * 60));
}

// ---------------------------------------------------------------------------
// Icons (kept local + minimal so this file stays drop-in; same stroke style
// as the icons already defined in OrderTrackingPage.jsx).
// ---------------------------------------------------------------------------

const IconTruck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="17.5" cy="17.5" r="1.5" />
  </svg>
);

const IconHome = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 11 8-7 8 7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v10h12V10" />
  </svg>
);

// ---------------------------------------------------------------------------
// Map markers — plain Leaflet divIcons (SVG matching the icons above) so no
// external marker image assets are needed, and OpenStreetMap tiles (free,
// no API key) so nothing paid was silently introduced.
// ---------------------------------------------------------------------------

const DRIVER_ICON = L.divIcon({
  className: 'tdl-marker',
  html: `
    <div style="width:34px;height:34px;border-radius:9999px;background:#A65A34;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(38,32,27,0.35);border:2px solid #fff;">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const DESTINATION_ICON = L.divIcon({
  className: 'tdl-marker',
  html: `
    <div style="width:30px;height:30px;border-radius:9999px;background:#26201B;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(38,32,27,0.35);border:2px solid #fff;">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="m4 11 8-7 8 7" />
        <path d="M6 10v10h12V10" />
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Keeps the map framed on whatever points are currently available —
// MapContainer only sets the view once on mount, so this re-centers /
// re-fits whenever the driver's location updates.
const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(points)]);

  return null;
};

/**
 * Live customer-facing driver tracking card.
 *
 * @param {string|number} driverId       order.delivery.deliveryMen.userId
 * @param {string}        orderStatus    live order status (e.g. live.status from the page)
 * @param {number}        [destination_lat] delivery destination latitude, if known
 * @param {number}        [destination_lang] delivery destination longitude, if known
 */
const TrackDriverLocation = ({ driverId, orderStatus, destination_lat,
  destination_lang}) => {
  const [driverLocation, setDriverLocation] = useState(null); // { lat, lng, updatedAt }
  const [connected, setConnected] = useState(false);
  const stompRef = useRef(null);

  console.log(driverId);
  console.log(driverLocation);

  const shouldTrack = orderStatus === 'OUT_FOR_DELIVERY' && !!driverId;

  useEffect(() => {
    if (!shouldTrack) {
      return undefined;
    }

    let cancelled = false;

    const connect = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.error('[DRIVER TRACKING WS] No JWT token found');
        return;
      }

      const socket = new SockJS('http://localhost:8087/ws', null, {
        withCredentials: true,
      });

      const { Client } = await import('@stomp/stompjs');

      const stompClient = new Client({
  webSocketFactory: () =>
    new SockJS('http://localhost:8087/ws', null, {
      withCredentials: true,
    }),

  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },

  reconnectDelay: 5000,

  debug: (str) => {
    console.log('[DRIVER TRACKING STOMP]', str);
  },

  onConnect: () => {
    console.log(
      '[DRIVER TRACKING] CONNECTED — subscribing to:',
      `/topic/driver/${driverId}/location`
    );

    setConnected(true);

    stompClient.subscribe(
      `/topic/driver/${driverId}/location`,
      (message) => {
        console.log(
          '[DRIVER TRACKING] MESSAGE RECEIVED:',
          message.body
        );

        try {
          const data = JSON.parse(message.body);

          console.log('[DRIVER TRACKING] LOCATION DATA:', data);

          const lat = data.latitude ?? data.lat;
          const lng = data.longitude ?? data.lng ?? data.lon;

          if (lat == null || lng == null) {
            console.warn('[DRIVER TRACKING] Missing coordinates:', data);
            return;
          }

          setDriverLocation({
            lat,
            lng,
            updatedAt: data.updatedAt ?? new Date().toISOString(),
          });
        } catch (err) {
          console.error(
            '[DRIVER TRACKING] Failed to parse location:',
            err
          );
        }
      }
    );
  },

  onStompError: (frame) => {
    console.error('[DRIVER TRACKING] STOMP ERROR:', frame);
    setConnected(false);
  },

  onWebSocketError: (error) => {
    console.error('[DRIVER TRACKING] WEBSOCKET ERROR:', error);
    setConnected(false);
  },

  onWebSocketClose: () => {
    console.log('[DRIVER TRACKING] WEBSOCKET CLOSED');
    setConnected(false);
  },

      });

      stompRef.current = stompClient;
      stompClient.activate();
    };

    connect();

    return () => {
      cancelled = true;
      if (stompRef.current) {
        stompRef.current.deactivate();
        stompRef.current = null;
      }
      setConnected(false);
    };
  }, [shouldTrack, driverId]);

  // Delivered: stop tracking, show a settled confirmation card.
  if (orderStatus === 'DELIVERED') {
    return (
      <div className="rounded-2xl border border-[#26201B]/8 bg-white p-6 shadow-[0_1px_2px_rgba(38,32,27,0.04)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E4F3EB] text-[#2F6B4F]">
            <IconHome className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-[#26201B]">Delivered</p>
            <p className="mt-0.5 text-sm text-[#26201B]/60">Your order has arrived. Enjoy your meal!</p>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled, or any status before OUT_FOR_DELIVERY: nothing live to show.
  // (The page's own cancelled banner already covers CANCELLED.)
  if (!shouldTrack) {
    return null;
  }

  const hasDestination = destination_lat != null && destination_lang != null;
  const distanceKm =
    hasDestination && driverLocation
      ? getDistanceKm(driverLocation.lat, driverLocation.lng, destination_lat, destination_lang)
      : null;
  const etaMinutes = estimateEtaMinutes(distanceKm);

  const mapPoints = [
    ...(driverLocation ? [[driverLocation.lat, driverLocation.lng]] : []),
    ...(hasDestination ? [[destination_lat, destination_lang]] : []),
  ];

  return (
    <div className="rounded-2xl border border-[#26201B]/8 bg-white p-6 shadow-[0_1px_2px_rgba(38,32,27,0.04)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: '#EFE7DD', color: '#A65A34' }}
          >
            <IconTruck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-[#26201B]">
              Your driver is on the way
            </p>
            {driverLocation ? (
              <p className="mt-1 text-sm text-[#26201B]/60">
                {hasDestination
                  ? distanceKm != null
                    ? `${formatDistance(distanceKm)} from your location`
                    : 'Calculating distance…'
                  : 'Live location received'}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#26201B]/60">Waiting for driver's location…</p>
            )}
          </div>
        </div>

        {/* Live connection indicator — same pattern as the page header's. */}
        <div
          className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
          style={{
            borderColor: connected ? 'rgba(63,146,104,0.25)' : 'rgba(38,32,27,0.12)',
            backgroundColor: connected ? '#E4F3EB' : '#FFFFFF',
            color: connected ? '#2F6B4F' : '#26201B99',
          }}
        >
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3F9268] opacity-60" />
            )}
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: connected ? '#3F9268' : '#26201B4D' }}
            />
          </span>
          {connected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Map — driver marker, destination marker, and a line between them. */}
      {mapPoints.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#26201B]/8" style={{ height: 220 }}>
          <MapContainer
            center={mapPoints[0]}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {driverLocation && (
              <Marker position={[driverLocation.lat, driverLocation.lng]} icon={DRIVER_ICON} />
            )}

            {hasDestination && (
              <Marker position={[destination_lat, destination_lang]} icon={DESTINATION_ICON} />
            )}

            {driverLocation && hasDestination && (
              <Polyline
                positions={[
                  [driverLocation.lat, driverLocation.lng],
                  [destination_lat, destination_lang],
                ]}
                pathOptions={{ color: '#A65A34', weight: 3, dashArray: '6 8' }}
              />
            )}

            <FitBounds points={mapPoints} />
          </MapContainer>
        </div>
      ) : (
        <div className="mt-4 flex h-[140px] items-center justify-center rounded-xl bg-[#F5F3EF] text-xs text-[#26201B]/50">
          Map will appear once location data is available.
        </div>
      )}

      {driverLocation && hasDestination && (
        <p className="mt-2 text-[11px] text-[#26201B]/40">
          Straight-line path shown — not an actual road route.
        </p>
      )}

      {hasDestination && etaMinutes != null && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F5F3EF] px-4 py-3">
          <span className="text-sm font-medium text-[#26201B]">
            Approximately {etaMinutes} min away
          </span>
          <span className="text-xs text-[#26201B]/40">(estimated, straight-line)</span>
        </div>
      )}

      {!hasDestination && (
        <div className="mt-4 rounded-xl bg-[#F5F3EF] px-4 py-3 text-xs text-[#26201B]/50">
          Distance and ETA will appear once delivery destination coordinates are available.
        </div>
      )}
    </div>
  );
};

export default TrackDriverLocation;