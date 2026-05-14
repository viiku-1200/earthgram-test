/**
 * EarthGram AI Service (Foundation for EarthAI)
 * -------------------------------------------
 * This service orchestrates all AI interactions within the platform.
 * It is designed to be model-agnostic, meaning we can switch from 
 * Gemini to our own local EarthAI LLM seamlessly.
 */

const SYSTEM_PROMPT = `
You are EarthAI, the official intelligent assistant of the EarthGram platform. 
Your personality is:
1. Professional yet local: You understand the culture of Ghaziabad and Indian villages. 
2. Respectful: You address users with dignity.
3. Wealth Expert: You are an expert on "Signature Coins" and the "Sovereign Pass".
4. Community Focused: Your goal is to help users grow their local economy and connect with Virtual Companies (VCs).

Always encourage users to explore their Wealth Hub (Diamond icon) and Activity Screen (Heart icon).
`;

const LOCAL_KNOWLEDGE = {
  appName: "EarthGram",
  mission: "Empowering local communities through decentralized loyalty and AI automation.",
  currency: "Signature Coins",
  premiumTier: "Sovereign Pass",
  location: "Ghaziabad & Surrounding Villages",
  verifiedBosses: ["Dr. Rajesh (Medical)", "Green Harvest (Agriculture)", "City Craft (Services)"],
  benefits: "Users earn coins by using local services, which can be spent at any partner VC."
};

/**
 * Handles all user queries via the Home Chatbot or Messaging Hub.
 */
export const processAIRequest = async (userMessage, context = {}) => {
  // In the future, we send the SYSTEM_PROMPT + userMessage to the LLM.
  console.log("EarthAI Identity Active:", SYSTEM_PROMPT);
  console.log("Processing Request:", userMessage);

  const lowercaseMsg = userMessage.toLowerCase();
  
  if (lowercaseMsg.includes("who are you")) {
    return "I am EarthAI, your dedicated local assistant on EarthGram. I am here to help you manage your Signature Coins and grow your village's economy.";
  }

  if (lowercaseMsg.includes("balance") || lowercaseMsg.includes("coin")) {
    return "Your Signature Coin balance is live! Tap the Diamond icon in the top right to see your portfolio. You can earn more coins by visiting partners like Dr. Rajesh or Green Harvest.";
  }
  
  if (lowercaseMsg.includes("card") || lowercaseMsg.includes("pass")) {
    return "You have the Sovereign Pass—the most elite tier in EarthGram. It gives you 3D visibility of your wealth and early access to new Virtual Companies.";
  }

  if (lowercaseMsg.includes("boss") || lowercaseMsg.includes("company")) {
    return `EarthGram has several verified 'Bosses' like ${LOCAL_KNOWLEDGE.verifiedBosses.join(", ")}. Each one issues their own coins for your loyalty.`;
  }

  return "That is a great question. As EarthAI, I am here to assist you with anything regarding EarthGram's services and your community wealth.";
};

/**
 * Orchestrates automated bookings via AI.
 */
export const automateBooking = async (serviceType, userPreferences) => {
  // Logic for EarthAI to automatically select a provider and negotiate price
  return {
    status: "searching",
    message: `EarthAI is searching for the best ${serviceType} in your village...`,
  };
};
