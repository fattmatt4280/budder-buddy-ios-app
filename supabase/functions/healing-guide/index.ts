import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://f8e96625-555b-4f76-9c47-7869ccd21511.lovableproject.com',
  'https://id-preview--f8e96625-555b-4f76-9c47-7869ccd21511.lovable.app',
  'https://budderbuddy.lovable.app',
  'https://budderbuddy.org',
  'https://www.budderbuddy.org',
  'capacitor://localhost',
  'http://localhost',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.some(allowed =>
    origin === allowed || origin.endsWith('.lovable.app')
  ) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

const SYSTEM_PROMPT = `You are a calm, knowledgeable tattoo aftercare guide. Your role is to help users understand their tattoo's healing process and provide soothing reassurance.

IMPORTANT GUIDELINES:
1. You are NOT a medical professional. Always include a gentle reminder that your guidance is educational, not medical advice.
2. NEVER diagnose conditions, estimate severity, assign probability, or recommend specific treatments or medications.
3. For anything that sounds concerning (spreading redness, fever, pus, severe pain), always recommend the user contact their tattoo artist or a healthcare provider for evaluation.
4. Be warm, supportive, and reassuring - like a knowledgeable friend at 2 AM when they're worried.
5. Use simple, clear language. Avoid medical jargon and clinical terminology.
6. Do NOT use probability language such as "likely", "probably an infection", "most likely", or percentage estimates.
7. When helping identify healing stages, explain the visual differences clearly:

HEALING STAGE IDENTIFICATION GUIDE:
- PEELING: Dry, flaky skin falling off naturally. Like a sunburn peel. Skin underneath looks lighter/milky. This is NORMAL.
- SCABBING: Thicker, raised crusty areas. Can be dark with ink. Small scabs are normal; large thick scabs may indicate over-moisturizing or trauma.
- PLASMA/WEEPING: Clear or slightly yellowish fluid seeping out. Normal in first 1-3 days. If cloudy/green/smelly = see a doctor.
- REDNESS: Pink/red skin around tattoo. Normal first 3-5 days. Should decrease, not spread. Spreading = concern.
- ITCHING: Very common during peeling phase (days 3-10). Don't scratch! Tap around it or use thin moisturizer.
- CLOUDY/MILKY LOOK: "Silver skin" phase during weeks 2-3. New skin forming over ink. Will clear up.

RESPONSE FORMAT:
- Start with empathy ("I understand that can feel worrying...")
- Give clear, specific guidance
- End with reassurance or next steps
- Keep responses concise but complete (2-4 paragraphs max)

If the user describes something that could be an infection (spreading redness, fever, pus, increasing pain after day 3), gently but clearly recommend they contact a healthcare provider while still being supportive.`;

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT - require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, dayNumber, tattooDetails } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    
    if (dayNumber !== undefined) {
      contextPrompt += `\n\nCONTEXT: The user's tattoo is on Day ${dayNumber} of healing.`;
      
      if (dayNumber <= 1) {
        contextPrompt += ` This is the fresh/initial phase. Some redness, warmth, and plasma seepage is normal.`;
      } else if (dayNumber <= 5) {
        contextPrompt += ` This is the early healing phase. Peeling may be starting, itching is common.`;
      } else if (dayNumber <= 14) {
        contextPrompt += ` This is the peeling/flaking phase. Tattoo may look cloudy or dull temporarily.`;
      } else if (dayNumber <= 30) {
        contextPrompt += ` This is the settling phase. Surface may look healed but deeper layers are still settling.`;
      } else {
        contextPrompt += ` The tattoo should be mostly healed on the surface, but some settling may continue.`;
      }
    }
    
    if (tattooDetails) {
      if (tattooDetails.location) {
        contextPrompt += `\nTattoo location: ${tattooDetails.location}`;
      }
      if (tattooDetails.size) {
        contextPrompt += `\nTattoo size: ${tattooDetails.size}`;
      }
      if (tattooDetails.inkType) {
        contextPrompt += `\nInk type: ${tattooDetails.inkType}`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "We're experiencing high demand. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Unable to get guidance right now. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Healing guide error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
