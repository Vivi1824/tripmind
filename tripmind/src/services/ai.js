import { supabase } from "./supabase";

function buildFallbackTrip(prompt) {
  const destination = prompt.trim().split(/\s+/).slice(0, 3).join(" ") || "your destination";

  return {
    title: `Trip plan for ${destination}`,
    summary: `A flexible itinerary inspired by your idea: ${prompt.trim()}.`,
    days: [
      {
        day: 1,
        activities: ["Arrival and a relaxed local walk", "Dinner at a cozy restaurant"],
        overnight: "City center",
      },
      {
        day: 2,
        activities: ["Morning sightseeing", "Afternoon coffee break and shopping"],
        overnight: "City center",
      },
      {
        day: 3,
        activities: ["Free time for museums or nature", "Departure with a souvenir stop"],
        overnight: "City center",
      },
    ],
    tips: ["Book transport early", "Leave room for spontaneous plans"],
  };
}

export async function parseTrip(prompt) {
  const cleanPrompt = prompt?.trim();

  if (!cleanPrompt) {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke("tripmind-ai", {
      body: { prompt: cleanPrompt },
    });

    if (error) {
      throw error;
    }

    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return buildFallbackTrip(cleanPrompt);
      }
    }

    return data ?? buildFallbackTrip(cleanPrompt);
  } catch (error) {
    console.warn("TripMind AI fallback used:", error);
    return buildFallbackTrip(cleanPrompt);
  }
}