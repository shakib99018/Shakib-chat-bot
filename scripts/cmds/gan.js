const fs = require("fs");
const axios = require("axios");
const path = require("path");

let lastPlayed = -1;

module.exports = {
  config: {
    name: "gan",
    version: "1.0.2",
    role: 0,
    author: "MOHAMMAD AKASH",
    shortDescription: "Play random song with command 🎶",
    longDescription: "Sends a random mp3 song from preset Catbox links.",
    category: "media",
    guide: "{p}gan"
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID } = event;

    const songLinks = [
      "https://files.catbox.moe/etsdn9.mp3",
      "https://files.catbox.moe/ayepdz.mp3",
      "https://files.catbox.moe/oaecnx.mp3",
      "https://files.catbox.moe/xtpf61.mp3",
      "https://files.catbox.moe/12grz0.mp3",
      "https://files.catbox.moe/aaqddo.mp3",
      "https://files.catbox.moe/k3acvx.mp3",
      "https://files.catbox.moe/nry1qv.mp3",
      "https://files.catbox.moe/23e8u1.mp3",
      "https://files.catbox.moe/y8dzik.mp3",
      "https://files.catbox.moe/z9d2e6.mp3",
      "https://files.catbox.moe/23e8u1.mp3",
      "https://files.catbox.moe/0xscc8.mp3",
      "https://files.catbox.moe/q4m2ad.mp3",
      "https://files.catbox.moe/y8bg4r.mp3",
      "https://files.catbox.moe/q61co1.mp3",
      "https://files.catbox.moe/euq7fo.mp3",
      "https://files.catbox.moe/x5f56o.mp3",
      "https://files.catbox.moe/avlqok.mp3",
      "https://files.catbox.moe/v0twt3.mp3",
      "https://files.catbox.moe/qmpvpt.mp3",
      "https://files.catbox.moe/kz38x2.mp3",
      "https://files.catbox.moe/ato2x9.mp3",
    ];

    if (songLinks.length === 0) {
      return api.sendMessage("❌ Nᴏ sᴏɴɢs ᴄᴏᴜʟᴅ ʙᴇ ғᴏᴜɴᴅ!", threadID, messageID);
    }

    // ⏳ React for loading
    api.setMessageReaction("🎵", messageID, () => {}, true);

    // 🎲 Random song index (avoid repeat)
    let index;
    do {
      index = Math.floor(Math.random() * songLinks.length);
    } while (index === lastPlayed && songLinks.length > 1);
    lastPlayed = index;

    const url = songLinks[index];
    const filePath = path.join(__dirname, `/cache/song_${index}.mp3`);

    try {
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        api.sendMessage(
          {
            body: "🎶 Hᴇʀᴇ's ʏᴏᴜʀ sᴏɴɢ 🎧",
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          async () => {
            fs.unlinkSync(filePath);
          },
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("Error writing file:", err);
        api.sendMessage("❌ Fᴀɪʟᴇᴅ ᴛᴏ sᴇɴᴅ sᴏɴɢ!", threadID, messageID);
      });

    } catch (err) {
      console.error("Download error:", err);
      api.sendMessage("⚠️ Fᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ sᴏɴɢ!", threadID, messageID);
    }
  }
};
