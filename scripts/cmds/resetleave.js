module.exports = {
  config: {
    name: "resetleave",
    version: "1.0",
    author: "Sourav Ahmed",
    countDown: 5,
    role: 1, // 1 = admin only (চাইলে 0 করলে সবাই use করতে পারবে)
    shortDescription: "Reset user's leave count",
    longDescription: "",
    category: "boxchat",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, threadsData }) {

    const mention = Object.keys(event.mentions);

    if (mention.length === 0) {
      return message.reply("😒 কাউরে mention কর আগে!");
    }

    const userId = mention[0];

    let leaveData = await threadsData.get(event.threadID, "data.leaveCount") || {};

    if (!leaveData[userId]) {
      return message.reply("😅 এই user এর কোনো leave record নাই!");
    }

    // Reset leave count
    delete leaveData[userId];

    await threadsData.set(event.threadID, leaveData, "data.leaveCount");

    return message.reply("✅ Leave count reset করা হইছে! আবার fresh start 😎");
  }
};
