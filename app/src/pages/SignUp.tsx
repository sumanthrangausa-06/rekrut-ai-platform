import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

type Audience = "candidate" | "recruiter";

const recruiterOptions = [
  "Recruiter",
  "Hiring Manager",
  "Founder",
  "Other",
] as const;
const experienceLevelOptions = [
  "0-2 Years",
  "3-5 Years",
  "6-10 years",
  "10+ years",
] as const;

export default function SignUp() {
  const [audience, setAudience] = useState<Audience>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recruiterType, setRecruiterType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false)
  const PUBLIC_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
];


  const handleAudienceChange = (next: Audience) => {
    setAudience(next);
    if (next !== "recruiter") {
      setRecruiterType("");
    }
  };
  const onSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
      return;
    }
    if (audience === "recruiter") {
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (PUBLIC_EMAIL_DOMAINS.includes(emailDomain)) {
      alert("Recruiters must sign up with a valid company email address (not Gmail, Yahoo, etc.).");
      return;
    }
  }

    setLoading(true);

    // 2. Supabase Signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: audience, 
          experience_level: experienceLevel,
          current_role: currentRole,
          company_name: companyName,
          recruiter_type: recruiterType
        }
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Success! Check your email for a confirmation link.");
    }

    setLoading(false);
  };


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload =
      audience === "recruiter"
        ? { audience, email, password, recruiterType,companyName }
        : { audience, email, password, experienceLevel,currentRole};

    console.log(payload);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/*Header*/}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Welcome</h1>
        {/* Audience Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => handleAudienceChange("candidate")}
              className={
                "px-4 py-2 text-sm font-medium rounded-sm transition-colors " +
                (audience === "candidate"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground")
              }
            >
              Candidate
            </button>

            <button
              type="button"
              onClick={() => handleAudienceChange("recruiter")}
              className={
                "px-4 py-2 text-sm font-medium rounded-sm transition-colors " +
                (audience === "recruiter"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground")
              }
            >
              Recruiter
            </button>
          </div>
        </div>
        </div>

        {/* Form */}
        <form onSubmit={onSignUpSubmit} className="space-y-4">
           {/*First and Last Name*/}
          <div className="space-y-1">
            <label className="text-sm font-medium">First Name</label>
            <input
              type = "text"
              value = {firstName}
              onChange ={(e) => setFirstName(e.target.value)}
              required
              placeholder = "First Name"
              className="w-full rounded-md border border-input px-3 py-2"
            />
            </div>
            <div className="space-y-1">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type = "text"
              value = {lastName}
              onChange ={(e) => setLastName(e.target.value)}
              required
              placeholder = "Last Name"
              className="w-full rounded-md border border-input px-3 py-2"
            />
            </div>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={
                audience === "recruiter"
                  ? "you@company.com"
                  : "you@example.com"
              }
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>
         
         {/* Recruiter Options */}
{audience === "recruiter" && (
  <>
    <div className="space-y-1">
      <label className="text-sm font-medium">
        Recruiter Type
      </label>
      <select
        value={recruiterType}
        onChange={(e) => setRecruiterType(e.target.value)}
        required
        className="w-full rounded-md border border-input px-3 py-2"
      >
        <option value="">Recruiter Type</option>
        {recruiterOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>

    <div className="space-y-1">
      <label className="text-sm font-medium">
        Company Name
      </label>
      <input
        type="text"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
        placeholder="e.g. Rekrut AI"
        className="w-full rounded-md border border-input px-3 py-2"
      />
    </div>
  </>
)}

{/* Candidate Options */}
{audience === "candidate" && (
  <>
    <div className="space-y-1">
      <label className="text-sm font-medium">
        Experience Level
      </label>
      <select
        value={experienceLevel}
        onChange={(e) => setExperienceLevel(e.target.value)}
        required
        className="w-full rounded-md border border-input px-3 py-2"
      >
        <option value="">What's Your Experience Level</option>
        {experienceLevelOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>

    <div className="space-y-1">
      <label className="text-sm font-medium">
        Current Role
      </label>
      <input
        type="text"
        value={currentRole}
        onChange={(e) => setCurrentRole(e.target.value)}
        required
        placeholder="e.g. Software Engineer"
        className="w-full rounded-md border border-input px-3 py-2"
      />
    </div>
    
  </>
)}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
       
{audience === "candidate" && (
  <div className="space-y-3 pt-2">
    <div className="relative">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>

    {/* Working Google Button */}
    <button
      type="button"
      onClick={async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) alert(error.message);
      }}
      className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white text-black py-2 text-sm font-medium hover:bg-gray-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span>Sign up with Google</span>
    </button>

    {/* Working LinkedIn Button */}
    <button
      type="button"
      onClick={async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "linkedin_oidc", // Updated to OIDC
          options: {
            scopes: "openid profile email",
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) alert(error.message);
      }}
      className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white text-black py-2 text-sm font-medium hover:bg-gray-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#0077b5" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
      <span>Sign up with LinkedIn</span>
    </button>
  </div>
)}

        </form>
      </div>
    </div>
  );}


