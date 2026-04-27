import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createIcon = (emoji, size = 32) =>
  L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: "",
  });

const restaurantIcon = createIcon("🍴", 28);
const partnerIcon = createIcon("🛵", 30);
const destIcon = createIcon("📍", 28);

const getDestination = (restaurantLat, restaurantLng, orderId) => {
  const charSum = (orderId || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const latOffset = ((charSum % 100) - 50) / 5000;
  const lngOffset = ((charSum % 137) - 68) / 5000;
  return [restaurantLat + latOffset, restaurantLng + lngOffset];
};

const getPartnerPosition = (restaurantPos, destPos, order) => {
  if (!order) return restaurantPos;
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  if (elapsed < 80) return restaurantPos;
  if (elapsed >= 120) return destPos;
  const progress = (elapsed - 80) / 40;
  return [
    restaurantPos[0] + (destPos[0] - restaurantPos[0]) * progress,
    restaurantPos[1] + (destPos[1] - restaurantPos[1]) * progress,
  ];
};

const SHOW_MAP_STATUSES = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"];

const DeliveryMap = ({ order, status }) => {
  const lat = order?.restaurant?.lat;
  const lng = order?.restaurant?.lng;

  const restaurantPos = [lat || 28.6139, lng || 77.209];
  const destPos = getDestination(restaurantPos[0], restaurantPos[1], order?.id || "");

  const [partnerPos, setPartnerPos] = useState(() => getPartnerPosition(restaurantPos, destPos, order));

  useEffect(() => {
    const tick = () => setPartnerPos(getPartnerPosition(restaurantPos, destPos, order));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order]);

  if (!SHOW_MAP_STATUSES.includes(status)) return null;
  if (typeof window === "undefined") return null;

  return (
    <div className="mb-4">
      <div className="h-48 sm:h-56 rounded-xl overflow-hidden">
      <MapContainer
        center={restaurantPos}
        zoom={14}
        style={{ height: "100%" }}
        className="z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={restaurantPos} icon={restaurantIcon} />
        <Marker position={destPos} icon={destIcon} />
        <Marker position={partnerPos} icon={partnerIcon} />
        <Polyline
          positions={[restaurantPos, destPos]}
          pathOptions={{ color: "#9ca3af", weight: 2, dashArray: "6 6" }}
        />
      </MapContainer>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
        🍴 Restaurant · 🛵 Delivery Partner · 📍 Your location
      </p>
    </div>
  );
};

export default DeliveryMap;
