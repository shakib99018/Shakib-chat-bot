module.exports = {
  config: {
    name: "autoreact",
    aliases: ["ar"],
    version: "6.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    role: 0,
    countDown: 0,
    category: "system",
    description: "Auto react on/off + react to every message"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    // global data init
    global.__autoReactStatus??= {};
    if (global.__autoReactStatus[threadID] === undefined)
      global.__autoReactStatus[threadID] = true; // ডিফল্ট ON

    const cmd = args[0]?.toLowerCase();

    if (cmd === "on") {
      global.__autoReactStatus[threadID] = true;
      return api.sendMessage("✅ AutoReact চালু করা হলো", threadID, messageID);
    }
    else if (cmd === "off") {
      global.__autoReactStatus[threadID] = false;
      return api.sendMessage("❌ AutoReact বন্ধ করা হলো", threadID, messageID);
    }
    else {
      const status = global.__autoReactStatus[threadID]? "✅ ON" : "❌ OFF";
      return api.sendMessage(`AutoReact Status: ${status}\n\nUsage:\nautoreact on\nautoreact off`, threadID, messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const { messageID, senderID, threadID } = event;
    if (!messageID) return;
    if (senderID === api.getCurrentUserID()) return;

    // global data init
    global.__autoReactStatus??= {};
    if (global.__autoReactStatus[threadID] === undefined)
      global.__autoReactStatus[threadID] = true;

    // OFF থাকলে রিয়েক্ট দিবে না
    if (!global.__autoReactStatus[threadID]) return;

    // তোমার কিউট ইমোজি লিস্ট 💫
    const reacts = [
      "💫","🚀","🎉","📸","🎊","💡","❤️","🚬","🧡","💉","💛","🍔","💚","🐸","🩵","🪳",
      "💙","🪱","💜","🐯","🤎","🙄","🖤","😶","🩶","🥵","🤍","🥶","🩷","💘","😥","😎",
      "🤨","💖","😁","💦","😑","🫶","🤧","👌","😪","🫰","👩‍❤️‍👨","👩‍❤️‍","✅","💐","🐼",
      "🌹","🐰","🌺","🍁","🌷","🍼","🪷","🍬","🌸","🍂","🔪","🌻","🎁","🌼","☔","🌈",
      "⚡","✨","⛈️","🕊️","☀️","🪽"
    ];

    const react = reacts[Math.floor(Math.random() * reacts.length)];

    // সাথে রিয়েক্ট
    api.setMessageReaction(react, messageID);
  }
};