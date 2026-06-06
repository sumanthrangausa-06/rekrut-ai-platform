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

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isRecruiter = roleData?.role === 'recruiter';
    const isAdmin = roleData?.role === 'admin';

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const jobId = pathParts[pathParts.indexOf('jobs') + 1];

    // LIST all published jobs
    if (req.method === 'GET' && !jobId && !pathParts.includes('my')) {
      const searchQuery = url.searchParams.get('search');
      const companyId = url.searchParams.get('company_id');
      const jobType = url.searchParams.get('job_type');
      const workMode = url.searchParams.get('work_mode');
      const location = url.searchParams.get('location');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            slug,
            logo_url,
            industry,
            company_size,
            verification_status
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (companyId) query = query.eq('company_id', companyId);
      if (jobType) query = query.eq('job_type', jobType);
      if (workMode) query = query.eq('work_mode', workMode);
      if (location) query = query.ilike('location', `%${location}%`);
      
      if (searchQuery) {
        query = query.textSearch('search_vector', searchQuery);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Jobs list error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        jobs: data,
        count,
        limit,
        offset
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LIST current user's jobs
    if (req.method === 'GET' && pathParts.includes('my')) {
      if (!isRecruiter && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Recruiters only' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET single job
    if (req.method === 'GET' && jobId && !pathParts.includes('applications')) {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            slug,
            logo_url,
            description,
            website,
            headquarters_location,
            company_size,
            industry,
            verification_status
          )
        `)
        .eq('id', jobId)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      supabase
        .from('jobs')
        .update({ view_count: data.view_count + 1 })
        .eq('id', jobId)
        .then();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CREATE job
    if (req.method === 'POST' && !jobId) {
      if (!isRecruiter && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Recruiters only' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = await req.json();

      if (!payload.company_id || !payload.title || !payload.description) {
        return new Response(JSON.stringify({ 
          error: 'Company ID, title, and description are required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: company } = await supabase
        .from('companies')
        .select('created_by, verification_status')
        .eq('id', payload.company_id)
        .single();

      if (!company) {
        return new Response(JSON.stringify({ error: 'Company not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (company.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ 
          error: 'You can only post jobs for companies you own' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (company.verification_status !== 'verified') {
        console.warn(`Job posted for unverified company: ${payload.company_id}`);
      }

      const jobData = {
        company_id: payload.company_id,
        created_by: user.id,
        title: payload.title.trim().substring(0, 200),
        description: payload.description.trim().substring(0, 10000),
        job_type: payload.job_type || 'full_time',
        work_mode: payload.work_mode || 'onsite',
        location: payload.location?.trim().substring(0, 200),
        salary_min: payload.salary_min,
        salary_max: payload.salary_max,
        salary_currency: payload.salary_currency || 'USD',
        experience_min: payload.experience_min,
        experience_max: payload.experience_max,
        required_skills: payload.required_skills || [],
        preferred_skills: payload.preferred_skills || [],
        education_requirement: payload.education_requirement?.substring(0, 500),
        application_deadline: payload.application_deadline,
        positions_available: payload.positions_available || 1,
        status: payload.status || 'draft',
      };

      if (jobData.salary_min && jobData.salary_max && jobData.salary_min > jobData.salary_max) {
        return new Response(JSON.stringify({ 
          error: 'Minimum salary cannot be greater than maximum salary' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (jobData.experience_min && jobData.experience_max && jobData.experience_min > jobData.experience_max) {
        return new Response(JSON.stringify({ 
          error: 'Minimum experience cannot be greater than maximum experience' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select(`
          *,
          companies:company_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .single();

      if (error) {
        console.error('Job creation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create job' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UPDATE job
    if (req.method === 'PUT' && jobId && !pathParts.includes('publish') && !pathParts.includes('close')) {
      const { data: job } = await supabase
        .from('jobs')
        .select('created_by, company_id')
        .eq('id', jobId)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: company } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', job.company_id)
        .single();

      if (job.created_by !== user.id && company?.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized to update this job' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = await req.json();
      const updateData = {};
      
      if (payload.title) updateData.title = payload.title.trim().substring(0, 200);
      if (payload.description) updateData.description = payload.description.trim().substring(0, 10000);
      if (payload.job_type) updateData.job_type = payload.job_type;
      if (payload.work_mode) updateData.work_mode = payload.work_mode;
      if (payload.location !== undefined) updateData.location = payload.location?.trim().substring(0, 200);
      if (payload.salary_min !== undefined) updateData.salary_min = payload.salary_min;
      if (payload.salary_max !== undefined) updateData.salary_max = payload.salary_max;
      if (payload.salary_currency) updateData.salary_currency = payload.salary_currency;
      if (payload.experience_min !== undefined) updateData.experience_min = payload.experience_min;
      if (payload.experience_max !== undefined) updateData.experience_max = payload.experience_max;
      if (payload.required_skills !== undefined) updateData.required_skills = payload.required_skills;
      if (payload.preferred_skills !== undefined) updateData.preferred_skills = payload.preferred_skills;
      if (payload.education_requirement !== undefined) updateData.education_requirement = payload.education_requirement?.substring(0, 500);
      if (payload.application_deadline !== undefined) updateData.application_deadline = payload.application_deadline;
      if (payload.positions_available !== undefined) updateData.positions_available = payload.positions_available;
      if (payload.status) updateData.status = payload.status;

      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('Job update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update job' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUBLISH job
    if (req.method === 'PUT' && jobId && pathParts.includes('publish')) {
      const { data: job } = await supabase
        .from('jobs')
        .select('created_by, company_id, status')
        .eq('id', jobId)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: company } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', job.company_id)
        .single();

      if (job.created_by !== user.id && company?.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'published' })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to publish job' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CLOSE job
    if (req.method === 'PUT' && jobId && pathParts.includes('close')) {
      const { data: job } = await supabase
        .from('jobs')
        .select('created_by, company_id')
        .eq('id', jobId)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: company } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', job.company_id)
        .single();

      if (job.created_by !== user.id && company?.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'closed' })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to close job' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE job
    if (req.method === 'DELETE' && jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('created_by, company_id')
        .eq('id', jobId)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: company } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', job.company_id)
        .single();

      if (job.created_by !== user.id && company?.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete job' }), {
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