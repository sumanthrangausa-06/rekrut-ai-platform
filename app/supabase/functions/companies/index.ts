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
    const companyId = pathParts[pathParts.indexOf('companies') + 1];

    // LIST companies — recruiters and admins only
    if (req.method === 'GET' && !companyId) {
      if (!isRecruiter && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Recruiters only' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch companies' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET single company
    if (req.method === 'GET' && companyId) {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Company not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CREATE company
    if (req.method === 'POST' && !companyId) {
      if (!isRecruiter && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Only recruiters can create companies' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = await req.json();

      if (!payload.name || payload.name.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Company name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const slug = payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', slug)
        .single();

      const finalSlug = existingCompany 
        ? `${slug}-${Date.now().toString().slice(-6)}` 
        : slug;

      const companyData = {
        name: payload.name.trim().substring(0, 200),
        slug: finalSlug,
        website: payload.website?.trim().substring(0, 500),
        description: payload.description?.trim().substring(0, 2000),
        logo_url: payload.logo_url?.trim().substring(0, 500),
        banner_url: payload.banner_url?.trim().substring(0, 500),
        headquarters_location: payload.headquarters_location?.trim().substring(0, 200),
        locations: payload.locations || [],
        company_size: payload.company_size,
        industry: payload.industry?.substring(0, 100),
        created_by: user.id,
        verification_status: 'pending',
      };

      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) {
        console.error('Company creation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create company' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabase
        .from('recruiter_profiles')
        .update({ company_id: data.id })
        .eq('user_id', user.id);

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UPDATE company
    if (req.method === 'PUT' && companyId && !pathParts.includes('verification-status')) {
      const { data: company } = await supabase
        .from('companies')
        .select('created_by, name, slug')
        .eq('id', companyId)
        .single();

      if (!company) {
        return new Response(JSON.stringify({ error: 'Company not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (company.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized to update this company' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = await req.json();
      const updateData: Record<string, unknown> = {};
      
      // Recalculate slug if name changed
      if (payload.name && payload.name.trim() !== company.name) {
        updateData.name = payload.name.trim().substring(0, 200);
        const newSlug = payload.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const { data: existingSlug } = await supabase
          .from('companies')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', companyId)
          .single();
        updateData.slug = existingSlug
          ? `${newSlug}-${Date.now().toString().slice(-6)}`
          : newSlug;
      } else if (payload.name) {
        updateData.name = payload.name.trim().substring(0, 200);
      }

      if (payload.website !== undefined) updateData.website = payload.website.trim().substring(0, 500);
      if (payload.description !== undefined) updateData.description = payload.description.trim().substring(0, 2000);
      if (payload.logo_url !== undefined) updateData.logo_url = payload.logo_url.trim().substring(0, 500);
      if (payload.banner_url !== undefined) updateData.banner_url = payload.banner_url.trim().substring(0, 500);
      if (payload.headquarters_location !== undefined) updateData.headquarters_location = payload.headquarters_location.trim().substring(0, 200);
      if (payload.locations !== undefined) updateData.locations = payload.locations;
      if (payload.company_size !== undefined) updateData.company_size = payload.company_size;
      if (payload.industry !== undefined) updateData.industry = payload.industry.substring(0, 100);

      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Company update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update company' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SUBMIT verification documents
    if (req.method === 'POST' && companyId && pathParts.includes('verify')) {
      const { data: company } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', companyId)
        .single();

      if (!company) {
        return new Response(JSON.stringify({ error: 'Company not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (company.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = await req.json();

      if (!payload.business_documents || payload.business_documents.length === 0) {
        return new Response(JSON.stringify({ error: 'At least one document is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('companies')
        .update({
          business_documents: payload.business_documents,
          verification_status: 'verification_pending',
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Verification submission error:', error);
        return new Response(JSON.stringify({ error: 'Failed to submit verification' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UPDATE verification status (admin only)
    if (req.method === 'PUT' && companyId && pathParts.includes('verification-status')) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { status } = await req.json();

      // Added 'verification_pending' so admin can reset a company back to that state
      if (!['verified', 'rejected', 'pending', 'verification_pending'].includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updateData: Record<string, unknown> = { verification_status: status };
      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to update status' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE company (soft delete)
    if (req.method === 'DELETE' && companyId) {
      const { data: company } = await supabase
        .from('companies')
        .select('created_by')
        .eq('id', companyId)
        .single();

      if (!company) {
        return new Response(JSON.stringify({ error: 'Company not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (company.created_by !== user.id && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('id', companyId);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete company' }), {
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