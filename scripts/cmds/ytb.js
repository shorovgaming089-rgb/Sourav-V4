const axios = require("axios");
const fs = require("fs");

// Fetch base API URL from GitHub
const baseApiUrl = async () => {
    const base = await axios.get(
        "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json"
    );
    return base.data.api;
};

module.exports = {
    config: {
        name: "ytb",
        version: "1.1.4",
        aliases: ["ytb"],
        author: "dipto",
        countDown: 5,
        role: 0,
        description: {
            en: "Download video, audio, or get info from YouTube"
        },
        category: "media",
        guide: {
            en:
                "  {pn} -v <name/link> : Download video\n" +
                "  {pn} -a <name/link> : Download audio\n" +
                "  {pn} -i <name/link> : View video info\n\n" +
                "Examples:\n" +
                "  {pn} -v shape of you\n" +
                "  {pn} -a shape of you\n" +
                "  {pn} -i shape of you"
        }
    },

    // Main Function
    onStart: async ({ api, args, event, commandName }) => {
        if (!args[0]) return api.sendMessage("❗ Please provide action (-v / -a / -i)", event.threadID);

        const action = args[0].toLowerCase();
        const YouTubeRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

        // If user entered a YouTube link
        if (YouTubeRegex.test(args[1])) {
            const match = args[1].match(YouTubeRegex);
            const videoID = match ? match[1] : null;

            if (!videoID)
                return api.sendMessage("❌ Invalid YouTube URL.", event.threadID);

            if (["-v", "-a"].includes(action)) {
                try {
                    const format = action === "-v" ? "mp4" : "mp3";
                    const filePath = `ytb_${format}_${videoID}.${format}`;

                    const API = await baseApiUrl();
                    const { data } = await axios.get(
                        `${API}/ytDl3?link=${videoID}&format=${format}&quality=3`
                    );

                    await api.sendMessage(
                        {
                            body: `• Title: ${data.title}\n• Quality: ${data.quality}`,
                            attachment: await dipto(data.downloadLink, filePath)
                        },
                        event.threadID,
                        () => fs.unlinkSync(filePath),
                        event.messageID
                    );
                } catch (e) {
                    console.error(e);
                    return api.sendMessage("❌ Download failed. Try again later.", event.threadID);
                }
            }
            return;
        }

        // Otherwise treat it as a search keyword
        args.shift();
        let keyword = args.join(" ");
        if (!keyword) return api.sendMessage("❗ Please provide a search keyword.", event.threadID);

        let result;
        try {
            const API = await baseApiUrl();
            result = (await axios.get(`${API}/ytFullSearch?songName=${keyword}`)).data.slice(0, 6);
        } catch (err) {
            return api.sendMessage("❌ Error: " + err.message, event.threadID);
        }

        if (!result.length)
            return api.sendMessage("⭕ No results found.", event.threadID);

        let msg = "";
        const thumbnails = [];
        let i = 1;

        for (const info of result) {
            thumbnails.push(diptoSt(info.thumbnail, "thumb.jpg"));
            msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
        }

        api.sendMessage(
            {
                body: msg + "Reply with a number to choose.",
                attachment: await Promise.all(thumbnails)
            },
            event.threadID,
            (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName,
                    messageID: info.messageID,
                    author: event.senderID,
                    result,
                    action
                });
            },
            event.messageID
        );
    },

    // Handle Reply
    onReply: async ({ event, api, Reply }) => {
        const { result, action } = Reply;
        const choice = parseInt(event.body);

        if (isNaN(choice) || choice < 1 || choice > result.length)
            return api.sendMessage("❌ Invalid number.", event.threadID);

        const selected = result[choice - 1];
        const videoID = selected.id;
        const API = await baseApiUrl();

        // Video / Audio Download
        if (["-v", "video", "mp4", "-a", "audio", "mp3", "music"].includes(action)) {
            try {
                const format = ["-a", "audio", "mp3", "music"].includes(action) ? "mp3" : "mp4";
                const filePath = `ytb_${format}_${videoID}.${format}`;

                const { data } = await axios.get(
                    `${API}/ytDl3?link=${videoID}&format=${format}&quality=3`
                );

                api.unsendMessage(Reply.messageID);

                await api.sendMessage(
                    {
                        body: `• Title: ${data.title}\n• Quality: ${data.quality}`,
                        attachment: await dipto(data.downloadLink, filePath)
                    },
                    event.threadID,
                    () => fs.unlinkSync(filePath),
                    event.messageID
                );
            } catch (e) {
                console.error(e);
                return api.sendMessage("❌ Download failed.", event.threadID);
            }
        }

        // Info
        if (action === "-i" || action === "info") {
            try {
                const { data } = await axios.get(`${API}/ytfullinfo?videoID=${videoID}`);

                api.unsendMessage(Reply.messageID);

                await api.sendMessage(
                    {
                        body:
                            `✨ Title: ${data.title}\n` +
                            `⏳ Duration: ${data.duration / 60} minutes\n` +
                            `📺 Resolution: ${data.resolution}\n` +
                            `👀 Views: ${data.view_count}\n` +
                            `👍 Likes: ${data.like_count}\n` +
                            `💬 Comments: ${data.comment_count}\n` +
                            `📌 Category: ${data.categories[0]}\n` +
                            `📺 Channel: ${data.channel}\n` +
                            `👤 Uploader ID: ${data.uploader_id}\n` +
                            `👥 Subscribers: ${data.channel_follower_count}\n` +
                            `🔗 Channel URL: ${data.channel_url}\n` +
                            `🔗 Video URL: ${data.webpage_url}`,
                        attachment: await diptoSt(data.thumbnail, "info_thumb.jpg")
                    },
                    event.threadID,
                    event.messageID
                );
            } catch (e) {
                console.error(e);
                return api.sendMessage("❌ Failed to load video info.", event.threadID);
            }
        }
    }
};

// Download file buffer
async function dipto(url, pathName) {
    try {
        const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathName, Buffer.from(response));
        return fs.createReadStream(pathName);
    } catch (err) {
        throw err;
    }
}

// Download stream (thumbnail)
async function diptoSt(url, pathName) {
    try {
        const response = await axios.get(url, { responseType: "stream" });
        response.data.path = pathName;
        return response.data;
    } catch (err) {
        throw err;
    }
}
