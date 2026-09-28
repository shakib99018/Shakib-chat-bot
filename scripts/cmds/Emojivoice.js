Install emojivoice.js const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "emojivoice",
 aliases: ["ev"],
 version: "1.3.0",
 author: "SHAKIB",
 countDown: 2,
 role: 0,
 shortDescription: "Auto voice reply on emoji",
 category: "group",
 guide: { en: "{pn}ev on\n{pn}ev off" }
 },

 // ===== এখানে তুমি emoji + voice link set করবা =====
 emojiAudioMap: {
 "🥱": ["https://files.catbox.moe/9pou40.mp3","https://files.catbox.moe/60cwcg.mp3"],
 "😁": ["https://files.catbox.moe/60cwcg.mp3"],
 "😌": ["https://files.catbox.moe/epqwbx.mp3"],
 "🥺": ["https://files.catbox.moe/wc17iq.mp3","https://files.catbox.moe/dv9why.mp3"],
 "🤭": ["https://files.catbox.moe/cu0mpy.mp3"],
 "😅": ["https://files.catbox.moe/jl3pzb.mp3"],
 "😏": ["https://files.catbox.moe/z9e52r.mp3"],
 "😞": ["https://files.catbox.moe/tdimtx.mp3"],
 "🤫": ["https://files.catbox.moe/0uii99.mp3"],
 "🍼": ["https://files.catbox.moe/p6ht91.mp3"],
 "🤔": ["https://files.catbox.moe/hy6m6w.mp3"],
 "🥰": ["https://files.catbox.moe/dv9why.mp3"],
 "🤦": ["https://files.catbox.moe/ivlvoq.mp3"],
 "😘": ["https://files.catbox.moe/sbws0w.mp3","https://files.catbox.moe/37dqpx.mp3"],
 "😑": ["https://files.catbox.moe/p78xfw.mp3"],
 "😢": ["https://files.catbox.moe/shxwj1.mp3"],
 "🙊": ["https://files.catbox.moe/3bejxv.mp3"],
 "🤨": ["https://files.catbox.moe/4aci0r.mp3"],
 "😡": ["https://files.catbox.moe/shxwj1.mp3","https://files.catbox.moe/h9ekli.mp3"],
 "🤬": ["https://files.catbox.moe/shxwj1.mp3","https://files.catbox.moe/h9ekli.mp3"],
 "🙈": ["https://files.catbox.moe/3qc90y.mp3"],
 "😍": ["https://files.catbox.moe/qjfk1b.mp3"],
 "😭": ["https://files.catbox.moe/itm4g0.mp3"],
 "😱": ["https://files.catbox.moe/mu0kka.mp3"],
 "😻": ["https://files.catbox.moe/y8ul2j.mp3"],
 "😿": ["https://files.catbox.moe/tqxemm.mp3"],
 "💔": ["https://files.catbox.moe/6yanv3.mp3"],
 "🤣": ["https://files.catbox.moe/2sweut.mp3","https://files.catbox.moe/jl3pzb.mp3"],
 "🥹": ["https://files.catbox.moe/jf85xe.mp3"],
 "😩": ["https://files.catbox.moe/b4m5aj.mp3"],
 "🫣": ["https://files.catbox.moe/ttb6hi.mp3"],
 "🐸": ["https://files.catbox.moe/utl83s.mp3","https://files.catbox.moe/sg6ugl.mp3"],
 "💋": ["https://files.catbox.moe/37dqpx.mp3"],
 "🫦": ["https://files.catbox.moe/61w3i0.mp3"],
 "😴": ["https://files.catbox.moe/rm5ozj.mp3"],
 "🙏": ["https://files.catbox.moe/7avi7u.mp3"],
 "😼": ["https://files.catbox.moe/4oz916.mp3"],
 "🖕": ["https://files.catbox.moe/593u3j.mp3","https://files.catbox.moe/dtua60.mp3"],
 "🥵": ["https://files.catbox.moe/l90704.mp3"],
 "🙂": ["https://files.catbox.moe/4oks08.mp3"],
 "😒": ["https://files.catbox.moe/mt5il0.mp3"],
 "😓": ["https://files.catbox.moe/zh3mdg.mp3"],
 "🤧": ["https://files.catbox.moe/zh3mdg.mp3"],
 "🙄": ["https://files.catbox.moe/vgzkeu.mp3"],
 "🤪": ["https://files.catbox.moe/ihmbr7.mp3"],
 "👍": ["https://files.catbox.moe/74bho5.mp3"]
 },
 // ====================================================

 onStart: async function ({ api, event, args, message }) {
 const { threadID } = event;
 const filePath = path.join(__dirname, "..", "data", "emojivoice_status.json");
 await fs.ensureFile(filePath);
 let status = await fs.readJson(filePath).catch(() => ({}));

 const cmd = args[0]?.toLowerCase();

 if (cmd === "on") {
 status[threadID] = true;
 await fs.writeJson(filePath, status, { spaces: 2 });
 return message.reply("✅ EmojiVoice ON");
 }

 if (cmd === "off") {
 status[threadID] = false;
 await fs.writeJson(filePath, status, { spaces: 2 });
 return message.reply("❌ EmojiVoice OFF");
 }

 return message.reply("📝 Usage:\nev on\n ev off");
 },

 onChat: async function ({ api, event }) {
 const { threadID, body, messageID } = event;
 if (!body) return;

 const filePath = path.join(__dirname, "..", "data", "emojivoice_status.json");
 let status = await fs.readJson(filePath).catch(() => ({}));

 if (!status[threadID]) return;

 const msg = body.trim();

 // Check: message e sudhu 1 ta emoji ache kina
 const onlyEmoji = msg.replace(/[\p{Emoji}\u200d\uFE0F]/gu, "");
 if (onlyEmoji.length > 0) return;

 const voiceList = this.emojiAudioMap[msg];
 if (!voiceList) return;

 // random voice select
 const voiceUrl = voiceList[Math.floor(Math.random() * voiceList.length)];

 try {
 const res = await axios.get(voiceUrl, { responseType: "stream", timeout: 20000 });
 return api.sendMessage({
 body: `🎙️`,
 attachment: res.data
 }, threadID, () => {}, messageID); // reply to that emoji
 } catch (e) {
 console.log("EmojiVoice Error:", e);
 const funnyErrors = [
 `ইমোজি দেওয়ার বদলে মুড়ি কিনে খা গা 🐸`,
 `ইমোজি দিয়ে লাভ নাই ভালো মুন্সী দেখো গা 💋`,
 `তুর ভয়েস দিতে গিয়ে বাশ খাইছি 😫`,
 `আবারও বললাম মুড়ি কিনে খাও গা 🤣🤣🫵`
 ];
 const randomError = funnyErrors[Math.floor(Math.random() * funnyErrors.length)];
 return api.sendMessage(randomError, threadID, () => {}, messageID);
 }
 }
};
