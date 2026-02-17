// app/api/mesh/route.ts
// Search MeSH (Medical Subject Headings) terms via NLM API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.approved) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ terms: [] });
    }

    // Use NLM MeSH API for autocomplete
    const response = await fetch(
      `https://id.nlm.nih.gov/mesh/lookup/term?label=${encodeURIComponent(query)}&match=contains&limit=15`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      // Fallback: return common neuroscience MeSH terms  matching query
      const fallbackTerms = getLocalMeSHTerms(query);
      return NextResponse.json({ terms: fallbackTerms });
    }

    const data = await response.json();
    const terms = data.map((item: { label: string; resource: string }) => ({
      label: item.label,
      uri: item.resource,
    }));

    return NextResponse.json({ terms });
  } catch (error) {
    console.error("Error searching MeSH:", error);
    // Return local fallback
    const query = new URL(req.url).searchParams.get("q") || "";
    return NextResponse.json({ terms: getLocalMeSHTerms(query) });
  }
}

function getLocalMeSHTerms(query: string) {
  const commonTerms = [
    "Neurosciences",
    "Brain",
    "Neurons",
    "Neuroimaging",
    "Electroencephalography",
    "Functional Neuroimaging",
    "Spectroscopy, Near-Infrared",
    "Cognition",
    "Consciousness",
    "Mindfulness",
    "Emotions",
    "Brain Waves",
    "Evoked Potentials",
    "Neuronal Plasticity",
    "Synaptic Transmission",
    "Cerebral Cortex",
    "Prefrontal Cortex",
    "Hippocampus",
    "Amygdala",
    "Brain Mapping",
    "Cognitive Neuroscience",
    "Behavioral Neuroscience",
    "Neuropsychology",
    "Attention",
    "Memory",
    "Learning",
    "Decision Making",
    "Executive Function",
    "Social Cognition",
    "Empathy",
    "Mirror Neurons",
    "Default Mode Network",
    "Connectome",
    "Neurofeedback",
    "Meditation",
    "Stress, Psychological",
    "Resilience, Psychological",
    "Mental Health",
    "Sleep",
    "Circadian Rhythm",
    "Acoustic Stimulation",
    "Sound",
    "Biofeedback, Psychology",
    "Interpersonal Relations",
    "Communication",
    "Child Development",
    "Visual Perception",
    "Sensory Perception",
    "Pain Perception",
    "Gratitude",
  ];

  const lower = query.toLowerCase();
  return commonTerms
    .filter((t) => t.toLowerCase().includes(lower))
    .map((label) => ({ label, uri: "" }));
}
