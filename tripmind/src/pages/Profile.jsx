import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";

export default function Profile() {
  const { user } = useAuth();
  const { favorites } = useTrip();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Profile</p>
        <h1 className="mt-2 text-3xl font-bold">My itineraries</h1>
        <p className="mt-3 text-gray-600">{user?.email || "Signed in user"}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold">Saved trips</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <p className="font-semibold">Paris · 3 days</p>
              <p className="mt-1 text-sm text-gray-600">Museum-focused itinerary with low-cost options.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <p className="font-semibold">Rome · weekend</p>
              <p className="mt-1 text-sm text-gray-600">Historic center and food stops.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold">Favorites</h2>
          {favorites.length ? (
            <div className="mt-4 space-y-3">
              {favorites.map((place) => (
                <div key={place.id} className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold">{place.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{place.address || "Favorite place"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No favorites saved yet.</p>
          )}
          <Link to="/" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Back to home
          </Link>
        </section>
      </div>
    </div>
  );
}
