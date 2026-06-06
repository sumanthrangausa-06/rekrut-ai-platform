/**
 * Matching Prompts - Rekrut AI Profile Matching Engine
 *
 * Production-ready prompts for GPT-4o-mini to extract structured profile
 * summaries from resumes and calculate job match scores.
 *
 * Cost-optimized: All prompts use GPT-4o-mini ($0.15/M input, $0.60/M output)
 * Caching recommendation: Cache profile summaries (embeddings rarely change).
 */

/**
 * System message pattern for the profile matching engine.
 * Use as: { role: "system", content: getMatchingSystemMessage() }
 */
export function getMatchingSystemMessage(): string {
  return `You are a senior technical recruiter and career strategist with 15 years of experience evaluating engineering talent. You are meticulous at extracting relevant information from resumes and providing honest, actionable match assessments. You always respond in valid JSON format with no markdown or explanatory text outside the JSON.`;
}

/**
 * Generates a prompt to extract structured profile information from raw resume text.
 */
export function generateProfileSummary(resumeText: string): string {
  return `You are a senior technical recruiter with 15 years of experience. Extract a structured profile summary from this resume. Focus on information relevant for job matching.

## Resume Text
"""
${resumeText}
"""

## Extraction Instructions

1. **Skills**: Extract ALL technical and soft skills mentioned. Include programming languages, frameworks, tools, methodologies, and domain expertise. Normalize names (e.g., "ReactJS" → "React", "PG" → "PostgreSQL"). Include proficiency indicators if stated.
2. **Experience**: Calculate total years of relevant professional experience. Count only full-time roles, internships, and significant contract work. Do NOT count education or personal projects toward experience years.
3. **Key Achievements**: Extract 3-5 quantifiable achievements (e.g., "reduced latency by 40%", "led team of 6 engineers", "shipped product used by 1M users"). Prefer metrics over vague descriptions.
4. **Education**: Summarize highest relevant degree, institution, and field of study. Include certifications if relevant.
5. **Role Fit**: Based on the skills and experience, suggest 2-4 roles this candidate would be a strong fit for (e.g., ["Senior Frontend Engineer", "Frontend Tech Lead", "UI Architect"]).

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "skills": [
    "Skill Name (proficiency if stated)",
    "Another Skill",
    "Third Skill"
  ],
  "experienceYears": 5,
  "keyAchievements": [
    "Quantifiable achievement with metric",
    "Another achievement",
    "Third achievement"
  ],
  "education": "Highest degree, Institution, Field — include year if available",
  "roleFit": [
    "Primary role fit",
    "Secondary role fit",
    "Stretch role fit"
  ]
}

experienceYears must be a number (integer). Include at least 5 skills if any are detectable. If resume text is insufficient or unclear, make reasonable inferences from context but mark uncertainty with conservative estimates.`;
}

/**
 * Generates a prompt to calculate job match score between a profile summary and job description.
 */
export function calculateJobMatch(
  resumeSummary: {
    skills: string[];
    experienceYears: number;
    keyAchievements: string[];
    education: string;
    roleFit: string[];
  },
  jobDescription: string
): string {
  return `You are a senior technical recruiter with 15 years of experience matching candidates to roles. Analyze how well this candidate matches the job description. Be objective and honest — this helps both the candidate and the employer.

## Candidate Profile
- **Skills**: ${resumeSummary.skills.join(", ")}
- **Experience**: ${resumeSummary.experienceYears} years
- **Key Achievements**: ${resumeSummary.keyAchievements.join("; ")}
- **Education**: ${resumeSummary.education}
- **Recommended Roles**: ${resumeSummary.roleFit.join(", ")}

## Job Description
"""
${jobDescription}
"""

## Analysis Instructions

1. **Skill Matches**: Compare candidate's skills to required skills in the job description. For each required skill:
   - "strong" = Candidate has the skill with relevant experience
   - "partial" = Candidate has related skill or basic familiarity
   - "missing" = Candidate does not have this skill

2. **Experience Match**: Compare years and relevance of experience to job requirements.

3. **Gap Areas**: Identify specific skills, experience, or qualifications the candidate is missing.

4. **Recommendation**: Provide an honest assessment:
   - Score 85-100: Strong match — recommend immediate interview
   - Score 70-84: Good match — recommend interview with note on gaps
   - Score 50-69: Partial match — may fit with some upskilling
   - Score below 50: Weak match — significant gaps to address

5. **Contextual Reasoning**: Consider that related skills often transfer (e.g., React → Vue, AWS → GCP). Don't penalize candidates for not having the exact same tech stack if they have demonstrable ability to learn.

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "matchScore": 78,
  "skillMatches": [
    { "skill": "React", "match": "strong" },
    { "skill": "TypeScript", "match": "partial" },
    { "skill": "GraphQL", "match": "missing" }
  ],
  "experienceMatch": "Assessment of how their ${resumeSummary.experienceYears} years of experience aligns with job requirements. 1-2 sentences.",
  "gapAreas": [
    "Specific gap (e.g., 'No experience with GraphQL — job requires it for API layer')",
    "Another gap if applicable",
    "A third gap if significant"
  ],
  "recommendation": "Honest recommendation: 2-3 sentences. If strong match, say why. If gaps exist, suggest how the candidate could address them (e.g., 'Consider taking a course in X' or 'Highlight your Y experience which transfers well')."
}

matchScore must be an integer 0-100. Include skillMatches for ALL skills mentioned in the job description requirements section. Be fair — related skills and transferable experience should not be scored as "missing" if they demonstrate capability.`;
}
