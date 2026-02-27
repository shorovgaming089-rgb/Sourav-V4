module.exports = {
  config: {
    name: "roast",
    version: "1.0",
    author: "Sourav Ahmed",
    countDown: 5,
    role: 0,
    shortDescription: "Funny roast command",
    longDescription: "",
    category: "fun",
    guide: "{pn} @mention / reply"
  },

  onStart: async function ({ message, event, api }) {

    let targetID;

    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } 
    else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } 
    else {
      return message.reply("😏 কাউরে mention কর অথবা reply দে roast দিতে!");
    }

    const info = await api.getUserInfo(targetID);
    const name = info[targetID].name;

    const roasts = [
      "তোর WiFi থেকেও তোর future slow 🤡",
      "কিরে মাদারবোর্ড বেশি পক পক করছ কেন 👺",
      "তোরে চুদি খান#কি 🐸",
      "তোর আম্মু-রে জিগা সৌরভ কে 🫦",
      "তোর আসল আব্বা তোর বাপ নয় লা 💩 আমি-আমি তোর আসল আব্বা 🤏👿",
      "তুই আয়নায় তাকাইলেও আয়না লজ্জা পায় 💀",
      "তোর brain buffering এ আটকা আছে 📡",
      "Google তোকে খুঁজলেও result পায় না 😭",
      "তুই offline থাকলেই দুনিয়া safe থাকে 😌",
      "তোর life এ update দরকার version 2.0 🔧"
    ];

    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

    return message.reply(
`

Target: ${name}

💬 ${randomRoast}
`
    );
  }
};
