import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const revenuecatApiKey = Deno.env.get("REVENUECAT_API_KEY");

    // Create client with user's JWT to get their identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify subscription with RevenueCat's server API
    if (!revenuecatApiKey) {
      console.error("REVENUECAT_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call RevenueCat REST API to get subscriber info
    // The app_user_id in RevenueCat should match the Supabase user ID
    const rcResponse = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${user.id}`,
      {
        headers: {
          "Authorization": `Bearer ${revenuecatApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rcResponse.ok) {
      const rcError = await rcResponse.text();
      console.error("RevenueCat API error:", rcResponse.status, rcError);
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rcData = await rcResponse.json();
    const subscriber = rcData.subscriber;

    // Check for active "pro" entitlement
    const proEntitlement = subscriber?.entitlements?.Pro;
    const isActive = proEntitlement &&
      new Date(proEntitlement.expires_date) > new Date();

    if (!isActive) {
      // No active subscription — update DB to reflect that
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      await adminClient
        .from("subscriptions")
        .upsert(
          {
            user_id: user.id,
            product_id: proEntitlement?.product_identifier || "none",
            status: "expired",
            expires_at: proEntitlement?.expires_date || null,
          },
          { onConflict: "user_id" }
        );

      return new Response(
        JSON.stringify({ status: "expired", isPro: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Active subscription — sync to DB
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { error: upsertError } = await adminClient
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          product_id: proEntitlement.product_identifier,
          status: "active",
          expires_at: proEntitlement.expires_date,
          original_purchase_date: proEntitlement.purchase_date,
          apple_original_transaction_id: proEntitlement.store_transaction_id || null,
          apple_transaction_id: proEntitlement.store_transaction_id || null,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: "active",
        isPro: true,
        expires_at: proEntitlement.expires_date,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Validate receipt error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
