module.exports = {
 config: {
 name: "msg",
 aliases: [],
 version: "1.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 role: 0,
 countDown: 0,

 description: {
 en: "Automatically replies to common messages."
 },

 category: "system",

 guide: {
 en: "{pn}"
 }
 },

 onStart: async function () {},

 onChat: async function ({ event, message }) {
 const text = String(event.body || "")
 .toLowerCase()
 .trim();

 if (!text) return;

 const triggers = [
 "kemon achis",
 "kemon asho",
 "shakib kemon asho",
 "কেমন",
 "achis",
 "axhis",
 "acis",
 "acho",
 "আছিস",
 "আছো"
 ];

 const matched = triggers.some(trigger =>
 text.includes(trigger)
 );

 if (!matched) return;

 return message.reply(
 "⎯⎯“সাকিব always ভালো থাকে'হহ এইডা আবার বলা লাগে নাকি -))🫵😄"
 );
 }
};
