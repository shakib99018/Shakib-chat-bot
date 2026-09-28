module.exports = {
  config: {
    name: "uid",
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    description: "Get user UID",
    category: "tool",
    cooldowns: 5
  },

  onStart: async function ({ event, message }) {
    let uid = event.senderID;

    if (event.messageReply) {
      uid = event.messageReply.senderID;
    } else if (
      event.mentions &&
      Object.keys(event.mentions).length
    ) {
      uid = Object.keys(event.mentions)[0];
    }

    return message.reply(`${uid}`);
  }
};