const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "cek",
    version: "1.1",
    author: "Muzan",
    countDown: 3,
    role: 0,
    shortDescription: "Generate an AI image using SeaArt.ai 🎇",
    longDescription: "Use /gen (prompt) to generate anime style images.",
    category: "ai",
    usage: "/gen (prompt)"
  },

  onStart: async function ({ api, event, args }) {
    try {
      let prompt = args.join(" ");
      if (!prompt && event.messageReply && event.messageReply.body) {
        prompt = event.messageReply.body;
      }

      if (!prompt) {
        return api.sendMessage(
          "⚠️ Please provide a prompt.\nExample: /cek A cute anime girl",
          event.threadID,
          event.messageID
        );
      }

      // Random reaction array
      const reactions = ["🔄", "📤", "⏳", "🎨", "🖼️"];
      const randomReact = () => reactions[Math.floor(Math.random() * reactions.length)];

      // First reaction
      api.setMessageReaction(randomReact(), event.messageID, () => {}, true);

      // Your SeaArt cookies here
      const cookie = [
        "deviceId=b8b37bae-5e29-4596-bdc9-80b3d4777726",
        "T=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzZWEtYXJ0IiwiYXVkIjpbImxvZ2luIl0sImV4cCI6MTc2ODI1MzM2MCwiaWF0IjoxNzYzMDY5MzYwLCJqdGkiOiI4ODgzNDM3Nzc0NTcyMTM0OSIsInBheWxvYWQiOnsiaWQiOiIxYTY2ZTY2MDNjZDQyMDZlNDYxZTExZGYyNTgyZGJhOSIsImVtYWlsIjoibWFzdGVyb2JlbnRlcnRhaW5tZW50QGdtYWlsLmNvbSIsImNyZWF0ZV9hdCI6MTc2MzA2ODc1MzcyNCwidG9rZW5fc3RhdHVzIjowLCJzdGF0dXMiOjEsImlzcyI6IiJ9fQ.Kk2tNpYlXXpac1yoxJsVxNcok11so3bWaHIb51a4oaO0MfcnEVQZfsHTUAT43MlzzADdOQQ5Gl3LaXUsNRKtWrxMtKk8bNC0W7IykJPmg6ztTUu73048WQPqyOs8HLM5nfa6ATxiWpLz3hDbhyus9UyAVfZmZfgDzq_61dWtUjlhK6epIJzUFROo_JureDFVFmqRcfIf-Y5jb4zMO3LHgmgmG49CtszLeMlVE38keXVoSP8kYJMYKie1WrKfvJwolwl4aQlhtfiado0u4XHb7my4bvYGHZYL4DXZ6DeTPk3HS8ffixmSFifOw3m4yO_GT5fCQ1DFuz1xXV5zVWwMyg"
      ].join("; ");

      // Step 1: Create task
      const createRes = await axios.post(
        "https://www.seaart.ai/api/v1/task/v2/text-to-img",
        {
          model_no: "1a486c58c2aa0601b57ddc263fc350d0",
          model_ver_no: "8c7f98318a01edf183d8de5fe160364e",
          channel_id: "",
          speed_type: 1,
          meta: {
            cfg_scale: 2,
            width: 1024,
            height: 1024,
            n_iter: 1,
            prompt,
            seed: Math.floor(Math.random() * 999999999),
            steps: 25,
            sampler_name: "Euler",
            negative_prompt:
              "lowres, worst quality, bad anatomy, jpeg artifacts, watermark, censored, bar_censor, deformed, mutated fingers, signature, text",
            lab_base: { conds: [] },
            lora_models: [],
            embeddings: [],
            generate: {
              anime_enhance: 2,
              mode: 0,
              gen_mode: 0,
              prompt_magic_mode: 2
            }
          },
          ss: 52
        },
        { headers: { cookie, "content-type": "application/json" } }
      );

      if (!createRes.data?.data?.id) {
        api.setMessageReaction("🚫", event.messageID, () => {}, true);
        return api.sendMessage(
          "❌ Failed to create task. Invalid session/cookie.",
          event.threadID,
          event.messageID
        );
      }

      const taskId = createRes.data.data.id;

      // Step 2: Poll for completion
      let imageUrl = null;

      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000));

        const statusRes = await axios.post(
          "https://www.seaart.ai/api/v1/task/batch-progress",
          { task_ids: [taskId] },
          { headers: { cookie, "content-type": "application/json" } }
        );

        const item = statusRes.data?.data?.items?.[0]?.img_uris?.[0];
        if (item?.url) {
          imageUrl = item.url;
          break;
        }

        api.setMessageReaction(randomReact(), event.messageID, () => {}, true);
      }

      if (!imageUrl) {
        api.setMessageReaction("🚫", event.messageID, () => {}, true);
        return api.sendMessage(
          "❌ Task completed but image URL not found.",
          event.threadID,
          event.messageID
        );
      }

      // Step 3: Download & send file
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });

      const output = path.join(__dirname, `seaart_${Date.now()}.webp`);
      fs.writeFileSync(output, imgRes.data);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(
        {
          body: `✅ SeaArt Image Generated!\nPrompt: "${prompt}"`,
          attachment: fs.createReadStream(output)
        },
        event.threadID,
        () => fs.unlinkSync(output),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.setMessageReaction("🚫", event.messageID, () => {}, true);
      api.sendMessage("❌ Error generating image.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
