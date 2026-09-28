const fs = require("fs");
const axios = require("axios");
const path = require("path");

let lastPlayed = -1;

module.exports = {
  config: {
    name: "hot",
    aliases: [],
    version: "1.0.0",
    role: 0,
    author: "Sakib",
    shortDescription: "Play random video with command 🎬",
    longDescription: "Sends a random MP4 video from preset Catbox links.",
    category: "media",
    guide: "{p}video"
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID } = event;

    const videoLinks = [
      "https://h.uguu.se/cVQRNClC.mp4",
      "https://n.uguu.se/pXOtMKHK.mp4",
      "https://d.uguu.se/ekzpujmE.mp4",
      "https://h.uguu.se/GzaivnoN.mp4",
      "https://d.uguu.se/GdAdQaJk.mp4",
      "https://d.uguu.se/xNAsviaX.mp4",
      "https://h.uguu.se/ZSdFLVTG.mp4",
      "https://d.uguu.se/zpZuOSjy.mp4"
    ];

    if (videoLinks.length === 0) {
      return api.sendMessage(
        "❌ Nᴏ ᴠɪᴅᴇᴏs ᴄᴏᴜʟᴅ ʙᴇ ғᴏᴜɴᴅ!",
        threadID,
        messageID
      );
    }

    // ⏳ React for loading
    api.setMessageReaction("🎬", messageID, () => {}, true);

    // 🎲 Random video index (avoid repeat)
    let index;

    do {
      index = Math.floor(Math.random() * videoLinks.length);
    } while (index === lastPlayed && videoLinks.length > 1);

    lastPlayed = index;

    const url = videoLinks[index];

    const cacheDir = path.join(__dirname, "cache");

    // Create cache folder if it doesn't exist
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const filePath = path.join(
      cacheDir,
      `video_${Date.now()}_${index}.mp4`
    );

    try {
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 120000
      });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          api.sendMessage(
            {
              body: "🎬 Hᴇʀᴇ's ʏᴏᴜʀ ᴠɪᴅᴇᴏ 🎥",
              attachment: fs.createReadStream(filePath)
            },
            threadID,
            () => {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            },
            messageID
          );
        } catch (err) {
          console.error("Send video error:", err);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          api.sendMessage(
            "❌ Fᴀɪʟᴇᴅ ᴛᴏ sᴇɴᴅ ᴠɪᴅᴇᴏ!",
            threadID,
            messageID
          );
        }
      });

      writer.on("error", (err) => {
        console.error("Error writing video:", err);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        api.sendMessage(
          "❌ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ!",
          threadID,
          messageID
        );
      });

    } catch (err) {
      console.error("Download error:", err);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      api.sendMessage(
        "⚠️ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ!",
        threadID,
        messageID
      );
    }
  }
};
