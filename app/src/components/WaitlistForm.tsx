import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Audience = 'recruiter' | 'candidate';

const formSchema = z.object({
  audience: z.enum(['recruiter', 'candidate']),
  full_name: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Please enter a valid email').max(255),
  // Recruiter fields
  company: z.string().max(100).optional(),
  role: z.string().optional(),
  team_size: z.string().optional(),
  hiring_for: z.string().max(1000).optional(),
  // Candidate fields
  current_role: z.string().max(100).optional(),
  target_roles: z.string().max(200).optional(),
  experience_level: z.string().optional(),
  challenge: z.string().optional(),
  // Common
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to be contacted about early access',
  }),
}).refine((data) => {
  // Recruiter must have role
  if (data.audience === 'recruiter' && !data.role) {
    return false;
  }
  return true;
}, {
  message: 'Please select your role',
  path: ['role'],
});

type FormData = z.infer<typeof formSchema>;

const recruiterRoles = [
  'Recruiter',
  'Hiring Manager',
  'Founder',
  'Other',
];

const teamSizes = ['1–10', '11–50', '51–200', '200+'];

const experienceLevels = [
  'Student',
  '0–2 years',
  '3–5 years',
  '6–10 years',
  '10+ years',
];

const challenges = [
  'Resume',
  'Interviews',
  'Finding matching roles',
  'Assessments',
  'Other',
];

export function WaitlistForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    // Capture UTM parameters from URL
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });
    setUtmParams(utm);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audience: 'recruiter',
      full_name: '',
      email: '',
      company: '',
      role: '',
      team_size: '',
      hiring_for: '',
      current_role: '',
      target_roles: '',
      experience_level: '',
      challenge: '',
      consent: false,
    },
  });

  const audience = form.watch('audience');

  // Reset conditional fields when audience changes
  const handleAudienceChange = (value: Audience) => {
    form.setValue('audience', value);
    // Reset audience-specific fields
    if (value === 'recruiter') {
      form.setValue('current_role', '');
      form.setValue('target_roles', '');
      form.setValue('experience_level', '');
      form.setValue('challenge', '');
    } else {
      form.setValue('company', '');
      form.setValue('role', '');
      form.setValue('team_size', '');
      form.setValue('hiring_for', '');
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Build payload based on audience
      const payload: Record<string, unknown> = {
        audience: data.audience,
        full_name: data.full_name,
        email: data.email,
        consent: data.consent,
        ...utmParams,
      };

      if (data.audience === 'recruiter') {
        payload.company = data.company;
        payload.role = data.role;
        payload.team_size = data.team_size;
        payload.hiring_for = data.hiring_for;
      } else {
        payload.current_role = data.current_role;
        payload.target_roles = data.target_roles;
        payload.experience_level = data.experience_level;
        payload.challenge = data.challenge;
        payload.role = 'Candidate'; // Set role for backwards compatibility
      }

      const { data: response, error } = await supabase.functions.invoke('waitlist', {
        body: payload,
      });

      if (error) {
        throw new Error(error.message || 'Failed to join waitlist');
      }

      if (response?.error === 'duplicate') {
        toast({
          title: "You're already on the list!",
          description: "We'll be in touch soon.",
        });
        setIsSuccess(true);
        return;
      }

      if (response?.error) {
        throw new Error(response.error);
      }

      toast({
        title: "You're on the waitlist!",
        description: "We'll invite you as we roll out.",
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast({
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border-2 border-foreground p-8 md:p-12 shadow-md text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-4">You're on the list!</h3>
          <p className="text-muted-foreground">
            Thanks for your interest in Rekrut AI. We'll be in touch as we roll out early access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-foreground p-8 md:p-12 shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Audience Toggle */}
          <div className="space-y-2">
            <FormLabel>I am a... *</FormLabel>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAudienceChange('recruiter')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-2 transition-colors ${
                  audience === 'recruiter'
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground/30 hover:border-foreground'
                }`}
              >
                Recruiter / Hiring Team
              </button>
              <button
                type="button"
                onClick={() => handleAudienceChange('candidate')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-2 transition-colors ${
                  audience === 'candidate'
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground/30 hover:border-foreground'
                }`}
              >
                Candidate
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Smith" {...field} className="border-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} className="border-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recruiter-specific fields */}
          {audience === 'recruiter' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} className="border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recruiterRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Select team size (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hiring_for"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you hiring for?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Engineering team expansion, sales roles..."
                        className="border-2 resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Candidate-specific fields */}
          {audience === 'candidate' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="current_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Role / Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer" {...field} className="border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Roles</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Engineer, Tech Lead" {...field} className="border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="challenge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biggest Challenge</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="What's your biggest challenge?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {challenges.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-2 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    I agree to be contacted about early access *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full shadow-md hover:shadow-sm hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Waitlist'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
