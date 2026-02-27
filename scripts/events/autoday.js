const cron = require("node-cron");

module.exports.config = {
  name: "autoday",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SouRav Ahmed",
  description: "Auto Morning Afternoon Night + Namaz",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.onLoad = async ({ api }) => {

  function box(text) {
    return `
╔═══❖•ೋ° °ೋ•❖═══╗
   ✨ 𝐀𝐔𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ✨
╠═════════════════╣
${text}
╚═══❖•ೋ° °ೋ•❖═══╝
`;
  }

  cron.schedule("* * * * *", async () => {

    const currentTime = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit"
    });

    console.log("Current Time:", currentTime);

    // 🔥 TEST TIME 3:45 AM
    if (currentTime === "02:30") {
      api.sendMessage(
        box("🧪 TEST SUCCESS!\n\nসময় এখন ২:৩০ 🕒\nBot ঠিকভাবে কাজ করছে 😎🔥"),
        global.config.ADMINBOT[0]
      );
    }

  });

};
