import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { parseTrip } from "../services/ai";
import { supabase } from "../services/supabase";
import { searchOpenTripMapAttractions } from "../services/opentripmap";

const PLACE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "museums", label: "Museums" },
  { value: "food", label: "Food" },
  { value: "nature", label: "Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "history", label: "History" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentTrip } = useTrip();
  const [prompt, setPrompt] = useState("I have 3 days in Barcelona and I love modern art with a tight budget.");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [city, setCity] = useState("Barcelona");
  const [category, setCategory] = useState("all");
  const [attractions, setAttractions] = useState([]);
  const [attractionsMeta, setAttractionsMeta] = useState(null);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [attractionsError, setAttractionsError] = useState("");
  const [saveState, setSaveState] = useState({ type: "", text: "" });

  const handleGenerate = async (e) => {
    e?.preventDefault();

    if (!prompt.trim()) {
      setError("Please describe your trip first.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await parseTrip(prompt);
      setResult(data || null);
      setCurrentTrip(data || null);
      navigate("/results");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating your trip plan.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAttractionsSearch = async (e) => {
    e?.preventDefault();
    setAttractionsLoading(true);
    setAttractionsError("");
    setAttractions([]);

    try {
      const data = await searchOpenTripMapAttractions({ city, category });
      setAttractionsMeta(data);
      setAttractions(data.attractions || []);
    } catch (err) {
      setAttractionsError(err.message || "Unable to load attractions.");
      setAttractionsMeta(null);
    } finally {
      setAttractionsLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!user) {
      setSaveState({ type: "error", text: "Log in to save your itinerary to Supabase." });
      return;
    }

    if (!result) {
      setSaveState({ type: "error", text: "Generate an itinerary first." });
      return;
    }

    setSaveState({ type: "", text: "" });

    const { error } = await supabase.from("itineraries").insert({
      user_id: user.id,
      title: result.title || "TripMind itinerary",
      summary: result.summary || "",
      payload: result,
    });

    if (error) {
      setSaveState({ type: "error", text: error.message || "Unable to save itinerary." });
    } else {
      setSaveState({ type: "success", text: "Itinerary saved successfully." });
    }
  };

  const itinerarySummary = useMemo(() => {
    if (!result?.days) {
      return [];
    }

    return result.days.map((day) => ({
      ...day,
      activities: day.activities || [],
    }));
  }, [result]);

  return (
    <div className="px-4 pb-12 pt-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">AI-powered travel planner</p>
          <h1 className="mt-3 text-4xl font-bold">Plan a smart trip in minutes</h1>
          <p className="mt-4 text-lg text-slate-200">
            Describe your interests, budget and time window and TripMind will turn it into an itinerary with real places to visit.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="mt-8 flex flex-col gap-3 lg:flex-row">
          <input
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            placeholder="Example: I have 3 days in Barcelona and I love modern art with a tight budget."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate itinerary"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-amber-200">{error}</p>}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Itinerary</p>
              <h2 className="text-2xl font-semibold">Your AI-generated plan</h2>
            </div>
          </div>

          {!result ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-gray-600">
              Generate a prompt to see a structured plan with day-by-day suggestions.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {result.title ? <h3 className="text-xl font-semibold">{result.title}</h3> : null}
              {result.summary ? <p className="text-gray-600">{result.summary}</p> : null}

              <div className="space-y-3">
                {itinerarySummary.map((day) => (
                  <div key={day.day} className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                    <h4 className="font-semibold">Day {day.day}</h4>
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {(day.activities || []).map((activity, index) => (
                        <li key={`${day.day}-${index}`} className="flex gap-2">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                    {day.overnight ? <p className="mt-2 text-sm text-gray-500">Overnight: {day.overnight}</p> : null}
                  </div>
                ))}
              </div>

              {result.tips?.length ? (
                <div className="rounded-xl bg-amber-50 p-4">
                  <h4 className="font-semibold text-amber-800">Tips</h4>
                  <ul className="mt-2 space-y-2 text-sm text-amber-700">
                    {result.tips.map((tip, index) => (
                      <li key={`${tip}-${index}`}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSaveItinerary}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Save to Supabase
              </button>
              {saveState.text ? (
                <p className={`text-sm ${saveState.type === "error" ? "text-red-500" : "text-green-600"}`}>
                  {saveState.text}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">External places</p>
          <h2 className="text-2xl font-semibold">Discover real stops</h2>
          <p className="mt-2 text-gray-600">Search OpenTripMap places and open each one in a dedicated detail page.</p>

          <form onSubmit={handleAttractionsSearch} className="mt-6 space-y-3">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {PLACE_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={attractionsLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {attractionsLoading ? "Searching..." : "Search places"}
            </button>
          </form>

          {attractionsError ? <p className="mt-4 text-sm text-red-500">{attractionsError}</p> : null}

          {attractionsMeta ? (
            <p className="mt-4 text-sm text-gray-600">Showing places in {attractionsMeta.city}.</p>
          ) : null}

          <div className="mt-6 space-y-3">
            {attractions.map((place) => (
              <Link
                key={place.id}
                to={`/place/${place.id}`}
                state={{ place }}
                className="block rounded-xl border border-gray-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{place.name}</h3>
                  {place.distance ? <span className="text-xs text-gray-500">{Math.round(place.distance)} m</span> : null}
                </div>
                <p className="mt-2 text-sm text-gray-600">{place.address || "Address not available"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(place.kinds || []).map((kind) => (
                    <span key={`${place.id}-${kind}`} className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {kind}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}