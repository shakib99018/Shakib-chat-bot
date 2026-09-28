module.exports = {
  config: {
    name: "runtime",
    aliases: ["rtm"],
    version: "2.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 0,
    role: 0,

    description: {
      en: "Show bot runtime."
    },

    category: "system",

    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    let runtime = "";

    if (days > 0) {
      runtime += `${days}d `;
    }

    if (hours > 0) {
      runtime += `${hours}h `;
    }

    if (minutes > 0) {
      runtime += `${minutes}m `;
    }

    runtime += `${seconds}s`;

    const msg =
`⏱️𝐑𝐮𝐧𝐧𝐢𝐧𝐠 𝐭𝐢𝐦𝐞 » ${runtime} » ☺️👌`;

    return message.reply(msg);
  }
};