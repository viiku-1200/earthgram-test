// --- MOCK AI HELPER (No external API) ---

/**
 * Simulates an AI response with a short delay.
 * Replace this with a real API call when your backend is ready.
 * @param {string} userText - The user's message
 * @param {string} _systemText - Unused (placeholder for future system prompt)
 * @returns {Promise<string>} A mock AI response
 */
export const getMockResponse = async (userText) => {
  await new Promise(res => setTimeout(res, 1200));

  const lower = userText.toLowerCase();

  if (lower.includes('ac') || lower.includes('repair') || lower.includes('fix')) {
    return "I found 3 AC repair experts near you! Ravi Electric is closest at 0.5 km and rated 4.9⭐. Want me to book them?";
  }
  if (lower.includes('food') || lower.includes('tiffin') || lower.includes('eat')) {
    return "Sharma Ji Fresh Tiffin is just 1.1km away with hot samosas ready! 🍱 Also try Gupta Sweets for Jalebis. Want directions?";
  }
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise')) {
    return "Iron Core Gym is 500m away — monthly pass at ₹800! 💪 They have morning batches at 6 AM. Shall I check availability?";
  }
  if (lower.includes('dance') || lower.includes('music')) {
    return "Rhythm Dance Academy has a Hip-Hop batch at 6 PM today! 💃 Only 300m away. Want me to reserve a spot?";
  }
  if (lower.includes('room') || lower.includes('rent') || lower.includes('flat')) {
    return "Found a 1 BHK in Gaur City — 800m away, no broker, direct owner chat! 🏠 Want the details?";
  }
  if (lower.includes('plumber') || lower.includes('pipe') || lower.includes('water')) {
    return "Amit Plumber is 0.8km away with a 4.5⭐ rating! He can reach you in ~10 minutes. Book now? 💧";
  }

  return "I'm here to help you find the best local services in Ghaziabad! Try asking about food, repairs, gyms, or rooms nearby 😊";
};

/**
 * Generates a polished business bio from rough text.
 * @param {string} roughBio - The user's rough business description
 * @returns {Promise<string>} A polished business pitch
 */
export const generateMockBio = async (roughBio) => {
  await new Promise(res => setTimeout(res, 1500));

  const lower = roughBio.toLowerCase();

  if (lower.includes('ac') || lower.includes('fridge') || lower.includes('repair')) {
    return "Your trusted neighborhood appliance repair expert in Ghaziabad — delivering fast, reliable AC & refrigerator solutions with same-day service and guaranteed satisfaction.";
  }
  if (lower.includes('food') || lower.includes('cook') || lower.includes('tiffin')) {
    return "Homestyle flavors crafted with love in Ghaziabad — freshly prepared meals delivered to your doorstep daily, because nothing beats the taste of home.";
  }
  if (lower.includes('tutor') || lower.includes('teach')) {
    return "Empowering Ghaziabad's students with personalized, result-driven tutoring — because every learner deserves a mentor who truly cares about their success.";
  }

  return "Ghaziabad's most reliable local professional — delivering exceptional quality, unmatched service, and complete customer satisfaction every single time.";
};
