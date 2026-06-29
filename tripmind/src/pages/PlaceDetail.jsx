import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { getOpenTripMapPlaceDetails } from "../services/opentripmap";
import { getWeatherByCity } from "../services/external";

export default function PlaceDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { favorites, toggleFavorite } = useTrip();
  const initialPlace = location.state?.place || null;

  const [place, setPlace] = useState(initialPlace);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(!initialPlace);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlace = async () => {
      if (initialPlace) {
        setPlace(initialPlace);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const details = await getOpenTripMapPlaceDetails(id);
        setPlace(details);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load this place.");
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [id, initialPlace]);

  useEffect(() => {
    if (!place?.address) {
      return;
    }

    const loadWeather = async () => {
      try {
        const weatherData = await getWeatherByCity(place.address.split(",")[0] || "Barcelona");
        setWeather(weatherData);
      } catch {
        setWeather(null);
      }
    };

    loadWeather();
  }, [place]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/" className="text-blue-600 hover:underline">
        ← Back to itinerary
      </Link>

      {loading ? (
        <p className="mt-6 text-gray-600">Loading place details...</p>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
      ) : place ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Place detail</p>
                <h1 className="text-3xl font-bold">{place.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(place)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  {favorites.some((item) => item.id === place.id) ? "♥ Saved" : "♡ Save"}
                </button>
                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Open on maps
                </a>
              </div>
            </div>

            <p className="mt-4 text-gray-700">{place.description || "This place is part of your planned route."}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {(place.kinds || []).map((kind) => (
                <span key={`${place.id}-${kind}`} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  {kind}
                </span>
              ))}
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-gray-500">Address</dt>
                <dd className="mt-1 text-gray-700">{place.address || "Address not available"}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-500">Coordinates</dt>
                <dd className="mt-1 text-gray-700">{place.lat}, {place.lon}</dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-sm uppercase tracking-wide text-slate-300">Weather</p>
              {weather ? (
                <>
                  <p className="mt-3 text-4xl font-semibold">{Math.round(weather.temperature)}°C</p>
                  <p className="mt-1 capitalize text-slate-300">{weather.condition}</p>
                </>
              ) : (
                <p className="mt-3 text-slate-300">Weather info will appear when available.</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Why it fits your trip</h2>
              <p className="mt-2 text-sm text-gray-600">
                This stop is included because it matches your selected interests and the neighborhood around your itinerary.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
