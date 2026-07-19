import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Group attendees into clusters (Jars) based on their profile data using Gemini 1.5 Flash.
 * @param {string} eventTitle - Title of the event
 * @param {string} eventDescription - Description of the event
 * @param {Array} attendees - Array of attendee documents
 * @returns {Promise<Array>} Array of grouped jars matching [{ label, reason, memberIds }]
 */
export const groupAttendeesIntoJars = async (eventTitle, eventDescription, attendees) => {
  if (!attendees || attendees.length === 0) {
    return [];
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { 
      responseMimeType: 'application/json' 
    }
  });

  // Prepare input profiles for the model to minimize token size and isolate personal details
  const attendeeProfiles = attendees.map(a => ({
    id: a._id.toString(),
    name: a.name,
    role: a.role,
    company: a.company,
    interests: a.interests || [],
    goals: a.goals || ''
  }));

  const prompt = `
You are an expert event networking AI. Your task is to analyze the profiles of attendees at a professional event and group them into semantic clusters called "Jars".
The goal is to help attendees meet the most relevant people (e.g. developers meeting other developers, founders finding co-founders, recruiters matching candidates, design enthusiasts talking UI/UX) instead of randomly mingling.

Event Title: ${eventTitle}
Event Description: ${eventDescription}

Here is the list of attendees to group:
${JSON.stringify(attendeeProfiles, null, 2)}

Instructions:
1. Group every attendee into a "Jar" based on semantic overlaps in their role, interests, and goals for the event.
2. Every attendee MUST be assigned to exactly one Jar. If an attendee doesn't fit well anywhere, create a "Diverse Innovators" or "General Mingle" Jar for outliers.
3. Keep Jars relatively balanced, ideally between 3 to 12 people per Jar, though it can vary depending on the total attendee count.
4. For each Jar, provide:
   - A short, creative, professional name/label (e.g. "Frontend Builders", "SaaS Founders", "Product Managers", "UX Explorers", "AI & ML Builders").
   - A brief, engaging reason/explanation (1-2 sentences) of why this group was created and what they have in common.
   - The array of attendee 'id' strings belonging to it.

Return ONLY a JSON array matching the following schema structure:
[
  {
    "label": "Name of the Jar",
    "reason": "Short explanation of the common thread connecting these members",
    "memberIds": ["attendee_id_1", "attendee_id_2"]
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON output from Gemini
    const jars = JSON.parse(responseText);
    
    if (!Array.isArray(jars)) {
      throw new Error('Gemini response is not a valid JSON array');
    }

    return jars;
  } catch (error) {
    console.error('Error grouping attendees with Gemini Flash:', error);
    throw new Error(`Failed to group attendees: ${error.message}`);
  }
};
