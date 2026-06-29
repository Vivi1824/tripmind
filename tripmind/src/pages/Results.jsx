import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/MapView";
import { useTrip } from "../context/TripContext";
import { searchOpenTripMapAttractions } from "../services/opentripmap";

export default function Results() {
  const { currentTrip, favorites, toggleFavorite } = useTrip();
  const [places, setPlaces] = useState([]);
  const [placesMeta, setPlacesMeta] = useState(null);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState("");

  const tripCity = currentTrip?.city || currentTrip?.destination || "Barcelona";
  const cityImage = `https://source.unsplash.com/featured/1200x600/?${encodeURIComponent(tripCity)}`;
  const tripInterests = useMemo(() => currentTrip?.interests || [], [currentTrip]);
  const itineraryDays = useMemo(() => currentTrip?.days || [], [currentTrip]);

  useEffect(() => {
    let active = true;

    const loadPlaces = async () => {
      if (!tripCity) {
        return;
      }

      try {
        setLoadingPlaces(true);
        setPlacesError("");
        const data = await searchOpenTripMapAttractions({ city: tripCity, category: "all" });
        if (active) {
          setPlaces(data.attractions || []);
          setPlacesMeta(data);
        }
      } catch (err) {
        if (active) {
          setPlacesError(err.message || "Unable to load related places.");
        }
      } finally {
        if (active) {
          setLoadingPlaces(false);
        }
      }
    };

    loadPlaces();

    return () => {
      active = false;
    };
  }, [tripCity]);

  if (!currentTrip) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <p className="text-gray-600">No trip generated yet.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 text-white shadow-xl">
        <img src={cityImage} alt={tripCity} className="h-56 w-full object-cover opacity-70" />
        <div className="p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Itinerary generated</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{currentTrip.title || "Your itinerary"}</h1>
            <p className="mt-3 text-lg text-slate-200">{currentTrip.summary || "A ready-to-explore plan."}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-slate-200">Best for</p>
            <p className="mt-1 text-xl font-semibold">{tripCity}</p>
          </div>
        </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {tripCity ? <span className="rounded-full bg-white/15 px-3 py-1 text-sm text-white">📍 {tripCity}</span> : null}
            {currentTrip.budget ? <span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm text-amber-100">💸 {currentTrip.budget}</span> : null}
            {tripInterests.map((interest) => (
              <span key={interest} className="rounded-full bg-cyan-400/20 px-3 py-1 text-sm text-cyan-100">
                {interest}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite({ id: `trip-${tripCity}`, name: currentTrip.title || tripCity, address: tripCity })}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {favorites.some((item) => item.id === `trip-${tripCity}`) ? "♥ Saved" : "♡ Save itinerary"}
            </button>
            <Link to="/profile" className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              View favorites
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Plan</p>
              <h2 className="text-2xl font-semibold">Day by day</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">
              Edit prompt
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {itineraryDays.map((day) => (
              <div key={day.day} className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-cyan-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Day {day.day}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {day.overnight || "Flexible"}
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {(day.activities || []).map((activity, index) => (
                    <li key={`${day.day}-${index}`} className="flex gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
                {day.overnight ? <p className="mt-3 text-sm text-gray-500">Overnight: {day.overnight}</p> : null}
              </div>
            ))}
          </div>

          {currentTrip.tips?.length ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-800">Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-amber-700">
                {currentTrip.tips.map((tip, index) => (
                  <li key={`${tip}-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Places</p>
              <h2 className="text-2xl font-semibold">Suggested stops</h2>
            </div>

            {loadingPlaces ? (
              <p className="mt-4 text-sm text-gray-600">Loading related places...</p>
            ) : placesError ? (
              <p className="mt-4 text-sm text-red-500">{placesError}</p>
            ) : (
              <>
                {placesMeta ? (
                  <p className="mt-3 text-sm text-gray-600">Showing places in {placesMeta.city}.</p>
                ) : null}
                <div className="mt-4 space-y-3">
                  {places.slice(0, 6).map((place) => (
                    <Link
                      key={place.id}
                      to={`/place/${place.id}`}
                      state={{ place }}
                      className="block rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-50 to-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{place.name}</h3>
                        {place.distance ? <span className="text-xs text-gray-500">{Math.round(place.distance)} m</span> : null}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{place.address || "Address not available"}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Favorites</p>
            <h2 className="text-2xl font-semibold">Saved spots</h2>
            {favorites.length ? (
              <div className="mt-4 space-y-3">
                {favorites.map((place) => (
                  <div key={place.id} className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                    <p className="font-semibold">{place.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{place.address || "Favorite place"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600">No favorites saved yet.</p>
            )}
          </div>

          <MapView places={places.slice(0, 8)} />
        </aside>
      </div>
    </div>
  );
}
