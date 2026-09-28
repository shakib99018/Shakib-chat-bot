const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const { configCommands } = global.GoatBot;
const { log } = global.utils;

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function extractUrlFromText(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
}

async function fetchCodeFromUrl(url) {
  const domain = getDomain(url);
  let fixedUrl = url;

  if (domain === "pastebin.com" && !url.includes("/raw/")) {
    fixedUrl = url.replace("pastebin.com/", "pastebin.com/raw/");
  }

  if (domain === "github.com" && url.includes("/blob/")) {
    fixedUrl = url
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");
  }

  try {
    const res = await axios.get(fixedUrl);
    let code = res.data;

    if (domain === "savetext.net") {
      const $ = cheerio.load(code);
      code = $("#content").text().trim();
    }

    return code;
  } catch {
    return null;
  }
}

function extractCommandName(code) {
  const nameMatch = code.match(/name\s*:\s*["']([^"']+)["']/);
  return nameMatch ? nameMatch[1].trim() + ".js" : null;
}

module.exports = {
  config: {
    name: "install",
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 3,
    role: 2,
    hasPrefix: false,
    description: "Install command via reply / code / url",
    category: "owner"
  },

  onStart: async function ({ args, message, event, api }) {

    let rawCode = "";
    let fileName = "";

    if (event.messageReply?.body) {
      const replyText = event.messageReply.body.trim();
      const url = extractUrlFromText(replyText);

      if (url) {
        rawCode = await fetchCodeFromUrl(url);
        if (!rawCode) return message.reply(
          "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐜𝐨𝐝𝐞 𝐟𝐫𝐨𝐦 𝐔𝐑𝐋."
        );
      } else {
        rawCode = replyText;
      }

      fileName = extractCommandName(rawCode);
    }

    else if (args[0] && isURL(args[0])) {
      rawCode = await fetchCodeFromUrl(args[0]);
      if (!rawCode) return message.reply(
        "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐨𝐫 𝐮𝐧𝐫𝐞𝐚𝐜𝐡𝐚𝐛𝐥𝐞 𝐔𝐑𝐋."
      );

      fileName = extractCommandName(rawCode);
    }

    else if (args.length >= 2 && args[0].endsWith(".js")) {
      fileName = args[0];
      rawCode = args.slice(1).join(" ");
    }

    if (!rawCode)
      return message.reply(
        "⚠️ 𝐍𝐨 𝐜𝐨𝐝𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞𝐝.\n\n" +
        "𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐜𝐨𝐝𝐞/𝐔𝐑𝐋, 𝐮𝐬𝐞 𝐚 𝐔𝐑𝐋, 𝐨𝐫:\n" +
        "𝐢𝐧𝐬𝐭𝐚𝐥𝐥 <𝐧𝐚𝐦𝐞.𝐣𝐬> <𝐜𝐨𝐝𝐞>"
      );

    if (!fileName)
      return message.reply(
        "❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐝𝐞𝐭𝐞𝐜𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐚𝐦𝐞.\n" +
        "𝐌𝐚𝐤𝐞 𝐬𝐮𝐫𝐞 𝐭𝐡𝐞 𝐜𝐨𝐝𝐞 𝐡𝐚𝐬 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐚𝐦𝐞 𝐟𝐢𝐞𝐥𝐝."
      );

    const filePath = path.join(process.cwd(), "scripts", "cmds", fileName);

    if (fs.existsSync(filePath)) {
      return message.reply(
        `⚠️ ${fileName} 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐞𝐱𝐢𝐬𝐭𝐬.\n\n` +
        "𝐑𝐞𝐚𝐜𝐭 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐨𝐯𝐞𝐫𝐰𝐫𝐢𝐭𝐞 𝐢𝐭.",
        (err, info) => {
          global.GoatBot.onReaction.set(info.messageID, {
            commandName: "install",
            author: event.senderID,
            data: { rawCode, fileName }
          });
        }
      );
    }

    fs.writeFileSync(filePath, rawCode);

    const load = global.utils.loadScripts(
      "cmds",
      fileName.replace(".js", ""),
      log,
      configCommands,
      api
    );

    if (load.status === "success") {
      return message.reply(
        `✅ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐞𝐝: ${fileName}\n` +
        `📌 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐑𝐞𝐚𝐝𝐲`
      );
    } else {
      return message.reply(
        `❌ 𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐢𝐨𝐧 𝐟𝐚𝐢𝐥𝐞𝐝: ${fileName}\n` +
        `⚠️ ${load.error?.message || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫"}`
      );
    }
  },

  onReaction: async function ({ Reaction, event, message, api }) {

    if (event.userID !== Reaction.author) return;

    const { rawCode, fileName } = Reaction.data;

    const filePath = path.join(process.cwd(), "scripts", "cmds", fileName);

    fs.writeFileSync(filePath, rawCode);

    const load = global.utils.loadScripts(
      "cmds",
      fileName.replace(".js", ""),
      log,
      configCommands,
      api
    );

    if (load.status === "success") {
      message.reply(
        `✅ 𝐎𝐯𝐞𝐫𝐰𝐫𝐢𝐭𝐭𝐞𝐧: ${fileName}\n` +
        `📌 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐑𝐞𝐚𝐝𝐲`
      );
    } else {
      message.reply(
        `❌ 𝐎𝐯𝐞𝐫𝐰𝐫𝐢𝐭𝐞 𝐟𝐚𝐢𝐥𝐞𝐝: ${fileName}\n` +
        `⚠️ ${load.error?.message || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫"}`
      );
    }
  }
};