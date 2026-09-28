module.exports = { 
 config: { 
 name: "info", 
 aliases: ["botinfo"], 
 version: "10.0.0", 
 author: "𝐌𝐚𝐑𝐮𝐅", 
 countDown: 0, 
 role: 0, 
 description: { en: "Show bot information." }, 
 category: "system", 
 guide: { en: "{pn}" } 
 }, 
 onStart: async function ({ api, message, config }) { 
 const uptime = process.uptime(); 
 const days = Math.floor(uptime / 86400); 
 const hours = Math.floor((uptime % 86400) / 3600); 
 const minutes = Math.floor((uptime % 3600) / 60); 
 const seconds = Math.floor(uptime % 60); 
 
 let runtime = ""; 
 if (days > 0) runtime += `${days}d `; 
 if (hours > 0) runtime += `${hours}h `; 
 if (minutes > 0) runtime += `${minutes}m `; 
 runtime += `${seconds}s`; 

 // এখানে ফিক্স - ২টা জায়গা চেক করবে
 const prefix = global.config?.PREFIX || global.GoatBot?.config?.prefix || "/";

 const msg = `━━━━━✦ 𝐁𝐨𝐓 𝐈𝐧𝐟𝐨 ✦━━━━━━

🤖 𝐍𝐚𝐦𝐞 » SHAKIB'𝐬 𝐁𝐨𝐓 💫🪽
👑 𝐎𝐰𝐧𝐞𝐫 » SHAKIB
⏰ 𝐔𝐩𝐭𝐢𝐦𝐞 » ${runtime}
⚡ 𝐏𝐫𝐞𝐟𝐢𝐱 » ${prefix}

━━ 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐮𝐬𝐢𝐧𝐠 𝐦𝐞 💫 ━━`; 
 
 return message.reply(msg); 
 } 
};