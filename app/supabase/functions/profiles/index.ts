import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('authorization');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: authHeader ? { authorization: authHeader } : {} },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GET profile with work experience and education
    if (req.method === 'GET' && !pathParts.includes('work-experience') && !pathParts.includes('education')) {
      const userId = pathParts[pathParts.indexOf('profiles') + 1] || user.id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const role = roleData?.role || 'candidate';
      let roleProfile = null;

      if (role === 'candidate') {
        const { data } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        roleProfile = data;

        // Get work experience
        const { data: workExp } = await supabase
          .from('work_experience')
          .select('*')
          .eq('candidate_id', userId)
          .order('start_date', { ascending: false });

        // Get education
        const { data: edu } = await supabase
          .from('education')
          .select('*')
          .eq('candidate_id', userId)
          .order('start_date', { ascending: false });

        if (roleProfile) {
          roleProfile.work_experience = workExp || [];
          roleProfile.education = edu || [];
        }
      } else if (role === 'recruiter') {
        const { data } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        roleProfile = data;
      }

      return new Response(JSON.stringify({
        ...profile,
        role,
        [role === 'candidate' ? 'candidate_profile' : 'recruiter_profile']: roleProfile,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UPDATE base profile
    if (req.method === 'PUT' && pathParts.length === 1) {
      const payload = await req.json();
      const sanitizedData = {};
      
      if (payload.full_name !== undefined) {
        sanitizedData.full_name = payload.full_name.trim().substring(0, 100);
      }
      if (payload.avatar_url !== undefined) {
        sanitizedData.avatar_url = payload.avatar_url.trim().substring(0, 500);
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UPDATE candidate profile
    if (req.method === 'PUT' && pathParts.includes('candidate')) {
      const payload = await req.json();
      const sanitizedData = {};
      
      if (payload.experience_level) sanitizedData.experience_level = payload.experience_level;
      if (payload.current_role) sanitizedData.current_role = payload.current_role;
      if (payload.target_roles) sanitizedData.target_roles = payload.target_roles;
      if (payload.skills) sanitizedData.skills = payload.skills;
      if (payload.current_location) sanitizedData.current_location = payload.current_location;
      if (payload.preferred_locations) sanitizedData.preferred_locations = payload.preferred_locations;
      if (payload.resume_url) sanitizedData.resume_url = payload.resume_url;

      const { data, error } = await supabase
        .from('candidate_profiles')
        .upsert({ user_id: user.id, ...sanitizedData })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to update candidate profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // WORK EXPERIENCE ENDPOINTS
    const workExpId = pathParts[pathParts.indexOf('work-experience') + 1];

    // GET work experience
    if (req.method === 'GET' && pathParts.includes('work-experience')) {
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('candidate_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch work experience' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CREATE work experience
    if (req.method === 'POST' && pathParts.includes('work-experience')) {
      const payload = await req.json();

      if (!payload.company || !payload.title || !payload.start_date) {
        return new Response(JSON.stringify({ error: 'Company, title, and start date are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('work_experience')
        .insert({ candidate_id: user.id, ...payload })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to create work experience' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UPDATE work experience
    if (req.method === 'PUT' && pathParts.includes('work-experience') && workExpId) {
      const payload = await req.json();

      const { data, error } = await supabase
        .from('work_experience')
        .update(payload)
        .eq('id', workExpId)
        .eq('candidate_id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to update work experience' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE work experience
    if (req.method === 'DELETE' && pathParts.includes('work-experience') && workExpId) {
      const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', workExpId)
        .eq('candidate_id', user.id);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete work experience' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // EDUCATION ENDPOINTS
    const eduId = pathParts[pathParts.indexOf('education') + 1];

    // GET education
    if (req.method === 'GET' && pathParts.includes('education')) {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('candidate_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch education' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CREATE education
    if (req.method === 'POST' && pathParts.includes('education')) {
      const payload = await req.json();

      if (!payload.school) {
        return new Response(JSON.stringify({ error: 'School is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('education')
        .insert({ candidate_id: user.id, ...payload })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to create education' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // UPDATE education
    if (req.method === 'PUT' && pathParts.includes('education') && eduId) {
      const payload = await req.json();

      const { data, error } = await supabase
        .from('education')
        .update(payload)
        .eq('id', eduId)
        .eq('candidate_id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to update education' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE education
    if (req.method === 'DELETE' && pathParts.includes('education') && eduId) {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', eduId)
        .eq('candidate_id', user.id);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete education' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
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