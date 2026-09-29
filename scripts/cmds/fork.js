module.exports = {
  config: {
    name: "fork",
    version: "4.0",
    author: "Shakib",
    countDown: 5,
    role: 0,
    shortDescription: "Show GitHub repository link",
    longDescription: "Show the Shakib Bot GitHub repository link",
    category: "utility",
    guide: {
      en: "{p}fork"
    }
  },

  langs: {
    en: {
      current: `📌 𝐒𝐇𝐀𝐊𝐈𝐁-𝐁𝐎𝐓
━━━━━━━━━━━━━━━━━━━━━━━━
👑 𝐜𝐫𝐞𝐚𝐭𝐨𝐫 : 𝐒𝐡𝐚𝐤𝐢𝐛
🔗 𝐫𝐞𝐩𝐨𝐬𝐢𝐭𝐨𝐫𝐲 : %1
💎 𝐬𝐭𝐚𝐭𝐮𝐬 : 𝐚𝐥𝐰𝐚𝐲𝐬 𝐮𝐩𝐝𝐚𝐭𝐢𝐧𝐠
━━━━━━━━━━━━━━━━━━━━━━━━`
    }
  },

  onStart: async function ({ message, getLang }) {
    try {
      const link =
        "https://github.com/shakib99018/Shakib-chat-bot";

      return message.reply(
        getLang("current", link)
      );
    } catch (error) {
      console.error("Fork command error:", error);
    }
  },

  onChat: async function ({ message, getLang, event }) {
    try {
      if (
        event.body &&
        event.body.trim().toLowerCase() === "fork"
      ) {
        const link =
          "https://github.com/shakib99018/Shakib-chat-bot";

        return message.reply(
          getLang("current", link)
        );
      }
    } catch (error) {
      console.error("Fork onChat error:", error);
    }
  }
};
