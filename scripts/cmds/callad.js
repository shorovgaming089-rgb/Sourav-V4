const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];
const VOICE_URL = "https://files.catbox.moe/j11iw3.mp3"; // optional voice note

module.exports = {
    config: {
        name: "call",
        version: "2.1",
        author: "亗🅼🅰ᥫᩣ🅼ᥫᩣ🆄🅽×͜×",
        countDown: 5,
        role: 0,
        description: {
            en: "Send message or feedback directly to admin"
        },
        category: "contacts admin",
        guide: {
            en: "{pn} <message>"
        }
    },

    langs: {
        en: {
            missingMessage: "❌ Please enter the message you want to send to admin",
            sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
            sendByUser: "\n- Sent from user",
            content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply this message to send message to user",
            success: "✅ Your message sent to admin successfully!",
            noAdmin: "❌ Bot has no admin at the moment"
        }
    },

    onStart: async function({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
        const { senderID, threadID, isGroup } = event;

        // 1️⃣ check message content
        if (!args[0]) return message.reply(getLang("missingMessage"));

        // 2️⃣ Set your UID as admin
        const adminBot = ["61583138223543"]; // ← তোমার UID

        // 3️⃣ get sender name
        const senderName = await usersData.getName(senderID);

        // 4️⃣ build message body
        const msg = "==📨 CALL ADMIN 📨=="
            + `\n- User Name: ${senderName}`
            + `\n- User ID: ${senderID}`
            + (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

        const formMessage = {
            body: msg + getLang("content", args.join(" ")),
            mentions: [{ id: senderID, tag: senderName }],
            attachment: await getStreamsFromAttachment(
                [...event.attachments, ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        // 5️⃣ Send message to each admin UID
        for (const uid of adminBot) {
            try {
                // Send text + optional voice note
                await api.sendMessage(
                    { ...formMessage, attachment: [...(formMessage.attachment || []), VOICE_URL] },
                    uid
                );
            } catch (err) {
                console.log("❌ Failed to send message to admin:", uid, err);
                // fallback: send to group thread if inbox fails
                await api.sendMessage(formMessage, threadID);
            }
        }

        // 6️⃣ confirmation
        return message.reply(`✅ Your message was sent successfully to admin! <@${adminBot[0]}>`);
    }
};
