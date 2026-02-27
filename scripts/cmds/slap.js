const DIG = require("discord-image-generation");
const fs = require("fs-extra");

const AVATAR_API = "https://nagi-sheishiro7x.vercel.app/pp?uid=";

module.exports = {
	config: {
		name: "slap",
		version: "2.6",
		author: "NTKhang (modified)",
		countDown: 5,
		role: 0,
		shortDescription: "Batslap image",
		longDescription: "Batslap image",
		category: "image",
		guide: {
			en: "{pn} @tag | reply"
		}
	},

	onStart: async function({ api, args, message, event, usersData }) {
		   const senderData = await usersData.get(event.senderID);

if (!senderData || senderData.money < 500) {
  return api.sendMessage(
    "Oy Goribs Cmd use er jonno 500tk lagbe 😾",
    event.threadID,
    event.messageID
  );
}

// Deduct 500 money
await usersData.set(event.senderID, {
  money: senderData.money - 500
});
		const uid1 = event.senderID;

		let uid2 = null;

		if (event.messageReply)
			uid2 = event.messageReply.senderID;
		else
			uid2 = Object.keys(event.mentions)[0];

		if (!uid2)
			return message.reply("You need to tag a person to slap ðŸ¸");

		if (uid2 === "61555908092045")
			return message.reply("Slap yourself Dude ðŸ¸ðŸ¸!");

		const avatar1 = `${AVATAR_API}${uid1}`;
		const avatar2 = `${AVATAR_API}${uid2}`;

		const img = await new DIG.Batslap().getImage(avatar1, avatar2);
		const pathSave = `${__dirname}/tmp/${uid1}_${uid2}_slap.png`;

		fs.writeFileSync(pathSave, Buffer.from(img));

		message.reply(
			{
				body: args.join(" ") || "BÃ³pppp ðŸ˜µâ€ðŸ’«ðŸ˜µ",
				attachment: fs.createReadStream(pathSave)
			},
			() => fs.unlinkSync(pathSave)
		);
	}
};
