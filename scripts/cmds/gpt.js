const axios = require("axios");

let cachedApi = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60;

async function getApiBase() {
  const now = Date.now();

  if (cachedApi && now - lastFetchTime < CACHE_DURATION) {
    return cachedApi;
  }

  const apis = await axios.get(
    "https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json"
  );

  cachedApi = apis.data.api;
  lastFetchTime = now;

  return cachedApi;
}

function splitMessage(text, limit = 1900) {
  const chunks = [];
  for (let i = 0; i < text.length; i += limit) {
    chunks.push(text.slice(i, i + limit));
  }
  return chunks;
}

module.exports = {
  config: {
    name: "gpt",
    version: "3.0",
    author: "S AY EM",
    countDown: 3,
    role: 0,
    shortDescription: "Super Fast GPT",
    longDescription: "Advanced GPT system with caching and smart response handling",
    category: "ai",
    guide: "{pn} <your question>"
  },

  onStart: async function ({ api, message, args, event }) {
    try {
      if (!args.length) {
        return message.reply(
          "❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐩𝐫𝐨𝐦𝐩𝐭.\n \n𝐄𝐱𝐦𝐩𝐥𝐞 :\n.gpt Explain JavaScript in simple terms"
        );
      }

      const prompt = args.join(" ");

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const loadingMsg = await message.reply("🤖 | 𝐓𝐡𝐢𝐧𝐤𝐢𝐧𝐠...  𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...");

      const baseUrl = await getApiBase();

      const response = await axios.get(
        `${baseUrl}/nayan/gpt3?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 30000 }
      );

      let aiResponse =
        response.data.response ||
        "I am unable to process your request at the moment.";

      api.unsendMessage(loadingMsg.messageID);

      const parts = splitMessage(aiResponse);

      for (const part of parts) {
        await message.reply(part);
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error("GPT Error:", error);

      return message.reply(
        "❌ | API Error occurred.\nPlease try again later."
      );
    }
  }
};
