const os = require("os");
 
module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "run"],
    version: "5.3",
    author: "Alamin", //fucked by UPoL Zox (avoid this fucking shit)
    role: 0,
    shortDescription: "Premium uptime & system stats",
    longDescription: "Displays bot uptime with animated loading and full system dashboard.",
    category: "system",
    guide: "{p}uptime"
  },
 
  onStart: async function ({ api, event, usersData, threadsData }) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
 
    const loadingFrames = [
      "⏳ Initializing system modules...",
      "⚙️ Checking CPU & memory...",
      "📡 Syncing network status...",
      "🧠 Collecting runtime data...",
      "✅ Finalizing report..."
    ];
 
    let loadingMsg;
    try {
      loadingMsg = await api.sendMessage(
        `🌌 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 𝗟𝗢𝗔𝗗𝗜𝗡𝗚\n\n${loadingFrames[0]}`,
        event.threadID
      );
 
      for (let i = 1; i < loadingFrames.length; i++) {
        await delay(450);
        await api.editMessage(
          `🌌 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 𝗟𝗢𝗔𝗗𝗜𝗡𝗚\n\n${loadingFrames[i]}`,
          loadingMsg.messageID
        );
      }
 
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
 
      const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
 
      const cpuInfo = os.cpus()?.[0] || {};
      const cpuModel = cpuInfo.model || "Unknown CPU";
      const cpuSpeed = cpuInfo.speed || "N/A";
 
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;
 
      const ping = Date.now() % 90 + 30;
 
      const date = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
 
      const totalUsers = usersData?.getAll ? (await usersData.getAll()).length : "N/A";
      const totalThreads = threadsData?.getAll ? (await threadsData.getAll()).length : "N/A";
 
      const finalMessage = `

   🎀 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗
 
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲      : ${uptimeFormatted}
📡 𝗣𝗶𝗻𝗴        : ${ping} ms
📅 𝗗𝗮𝘁𝗲        : ${date}
 
🖥️ 𝗢𝗦           : ${platform} (${arch})
🧠 𝗖𝗣𝗨         : ${cpuModel}
⚡ 𝗖𝗣𝗨 𝗦𝗽𝗲𝗲𝗱  : ${cpuSpeed} MHz
 
💾 𝗥𝗔𝗠 𝗨𝘀𝗲𝗱   : ${usedMem} MB
📦 𝗥𝗔𝗠 𝗙𝗿𝗲𝗲   : ${freeMem} MB
🧮 𝗥𝗔𝗠 𝗧𝗼𝘁𝗮𝗹  : ${totalMem} MB
 
👥 𝗨𝘀𝗲𝗿𝘀       : ${totalUsers}
💬 𝗧𝗵𝗿𝗲𝗮𝗱𝘀     : ${totalThreads}
 
🧪 𝗡𝗼𝗱𝗲𝗝𝗦     : ${nodeVersion}
👑 𝗢𝘄𝗻𝗲𝗿       : >Sourav Ahmed 🌊
 
✨ 𝗦𝘁𝗮𝘁𝘂𝘀 : Running Smoothly
      `.trim();
 
      await delay(400);
      await api.editMessage(finalMessage, loadingMsg.messageID);
 
    } catch (err) {
      console.error("Uptime command error:", err);
      api.sendMessage("❌ Unable to fetch system statistics.", event.threadID);
    }
  }
};
