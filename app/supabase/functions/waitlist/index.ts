import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistPayload {
  audience?: string;
  full_name: string;
  email: string;
  company?: string;
  role?: string;
  team_size?: string;
  hiring_for?: string;
  current_role?: string;
  target_roles?: string;
  experience_level?: string;
  challenge?: string;
  consent: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: WaitlistPayload = await req.json();
    
    // Server-side validation
    if (!payload.full_name || payload.full_name.trim().length === 0) {
      console.log('Validation failed: full_name is required');
      return new Response(JSON.stringify({ error: 'Full name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!payload.email || payload.email.trim().length === 0) {
      console.log('Validation failed: email is required');
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      console.log('Validation failed: invalid email format');
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate audience
    const audience = payload.audience || 'recruiter';
    if (audience !== 'recruiter' && audience !== 'candidate') {
      console.log('Validation failed: invalid audience');
      return new Response(JSON.stringify({ error: 'Invalid audience type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Role is required for recruiters
    if (audience === 'recruiter' && (!payload.role || payload.role.trim().length === 0)) {
      console.log('Validation failed: role is required for recruiters');
      return new Response(JSON.stringify({ error: 'Role is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!payload.consent) {
      console.log('Validation failed: consent is required');
      return new Response(JSON.stringify({ error: 'You must agree to be contacted' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize and validate field lengths
    const sanitizedData: Record<string, unknown> = {
      full_name: payload.full_name.trim().substring(0, 100),
      email: payload.email.trim().toLowerCase().substring(0, 255),
      audience: audience,
      consent: payload.consent,
      source: 'landing',
      utm_source: payload.utm_source?.trim().substring(0, 100) || null,
      utm_medium: payload.utm_medium?.trim().substring(0, 100) || null,
      utm_campaign: payload.utm_campaign?.trim().substring(0, 100) || null,
      utm_content: payload.utm_content?.trim().substring(0, 100) || null,
      utm_term: payload.utm_term?.trim().substring(0, 100) || null,
    };

    // Add audience-specific fields
    if (audience === 'recruiter') {
      sanitizedData.company = payload.company?.trim().substring(0, 100) || null;
      sanitizedData.role = payload.role?.trim().substring(0, 50) || null;
      sanitizedData.team_size = payload.team_size?.trim().substring(0, 20) || null;
      sanitizedData.hiring_for = payload.hiring_for?.trim().substring(0, 1000) || null;
    } else {
      // Candidate
      sanitizedData.role = 'Candidate'; // Set role for backwards compatibility
      sanitizedData.current_role = payload.current_role?.trim().substring(0, 100) || null;
      sanitizedData.target_roles = payload.target_roles?.trim().substring(0, 200) || null;
      sanitizedData.experience_level = payload.experience_level?.trim().substring(0, 50) || null;
      sanitizedData.challenge = payload.challenge?.trim().substring(0, 100) || null;
    }

    console.log('Processing waitlist signup for:', sanitizedData.email, 'audience:', audience);

    // Create Supabase client with service role key for secure insert
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('waitlist_leads')
      .insert(sanitizedData)
      .select('id, email')
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Handle duplicate email (unique constraint violation)
      if (error.code === '23505') {
        return new Response(JSON.stringify({ 
          error: 'duplicate',
          message: "You're already on the list!" 
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to join waitlist' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully added to waitlist:', data.id);

    return new Response(JSON.stringify({ 
      success: true,
      message: "You're on the waitlist!" 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
