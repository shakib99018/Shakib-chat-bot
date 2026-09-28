Install prefix.js const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

const VIDEO_URL = "https://i.imgur.com/PrNifqA.mp4";

const CACHE_DIR = path.join(__dirname, "cache");
const VIDEO_PATH = path.join(CACHE_DIR, "prefix.mp4");

// =========================================
// DOWNLOAD VIDEO
// =========================================

async function getVideo() {
	await fs.ensureDir(CACHE_DIR);

	if (await fs.pathExists(VIDEO_PATH)) {
		const stat = await fs.stat(VIDEO_PATH);

		if (stat.size > 1000) {
			return fs.createReadStream(VIDEO_PATH);
		}
	}

	const response = await axios({
		method: "GET",
		url: VIDEO_URL,
		responseType: "arraybuffer",
		timeout: 30000,
		headers: {
			"User-Agent": "Mozilla/5.0"
		}
	});

	await fs.writeFile(
		VIDEO_PATH,
		Buffer.from(response.data)
	);

	return fs.createReadStream(VIDEO_PATH);
}

// =========================================
// COMMAND
// =========================================

module.exports = {

	config: {
		name: "prefix",
		version: "3.2",
		author: "Shakib",
		countDown: 5,
		role: 0,
		description: "Show and change bot prefix",
		category: "config"
	},

	langs: {

		en: {

			usage:
				"❌ Usage:\n" +
				"prefix <newPrefix>\n" +
				"prefix reset\n" +
				"prefix <newPrefix> -g",

			reset:
				"✅ Prefix reset successful!\n" +
				"🔰 System prefix: %1",

			onlyAdmin:
				"⛔ Only bot admin can change global prefix.",

			confirmGlobal:
				"⚙️ Global prefix change requested.\n" +
				"👉 React to this message to confirm.",

			confirmThisThread:
				"🛠️ Group prefix change requested.\n" +
				"👉 React to this message to confirm.",

			successGlobal:
				"✅ Global prefix changed!\n" +
				"🆕 New prefix: %1",

			successThisThread:
				"✅ Group prefix changed!\n" +
				"🆕 New group prefix: %1"
		}
	},

	// =========================================
	// ON START
	// =========================================

	onStart: async function ({
		message,
		role,
		args,
		commandName,
		event,
		threadsData,
		getLang
	}) {

		// =========================================
		// PREFIX INFO
		// শুধু "prefix" লিখলে
		// =========================================

		if (!args || args.length === 0) {

			try {

				const systemPrefix =
					global.GoatBot.config.prefix;

				const groupPrefix =
					global.utils.getPrefix(
						event.threadID
					);

				const threadInfo =
					await threadsData.get(
						event.threadID
					);

				const groupName =
					threadInfo?.threadName ||
					"Unknown Group";

				const time =
					moment()
						.tz("Asia/Dhaka")
						.format("hh:mm A");

				const date =
					moment()
						.tz("Asia/Dhaka")
						.format("DD MMM YYYY");

				const owner =
					global.GoatBot.config.adminName ||
					"Shakib";

				let video = null;

				try {
					video = await getVideo();
				} catch (error) {
					console.error(
						"[PREFIX VIDEO ERROR]",
						error
					);
				}

				const replyData = {

					body:
`╭━━〔 🤖 PREFIX 〕━━╮
┃ 🏷️ Group : ${groupName}
┃ 🔰 System : 『 ${systemPrefix} 』
┃ 💬 Group : 『 ${groupPrefix} 』
┃ ⏰ Time : ${time}
┃ 📅 Date : ${date}
┃ 👑 Owner : ${owner}
┃ ⚡ Status : ONLINE
╰━━〔 ✨ Shakib 〕━━╯`

				};

				if (video) {
					replyData.attachment = video;
				}

				return message.reply(
					replyData
				);

			} catch (error) {

				console.error(
					"[PREFIX INFO ERROR]",
					error
				);

				return message.reply(
					"❌ Prefix information দেখাতে সমস্যা হয়েছে।"
				);
			}
		}

		// =========================================
		// RESET
		// =========================================

		if (
			String(args[0]).toLowerCase() === "reset"
		) {

			await threadsData.set(
				event.threadID,
				null,
				"data.prefix"
			);

			return message.reply(
				getLang(
					"reset",
					global.GoatBot.config.prefix
				)
			);
		}

		// =========================================
		// NEW PREFIX
		// =========================================

		const newPrefix =
			String(args[0]).trim();

		const setGlobal =
			args[1] &&
			String(args[1]).toLowerCase() === "-g";

		if (!newPrefix) {

			return message.reply(
				getLang("usage")
			);
		}

		if (newPrefix.length > 10) {

			return message.reply(
				"❌ Prefix maximum 10 characters হতে পারবে।"
			);
		}

		// =========================================
		// GLOBAL PREFIX ADMIN CHECK
		// =========================================

		if (setGlobal && role < 2) {

			return message.reply(
				getLang("onlyAdmin")
			);
		}

		// =========================================
		// CONFIRMATION VIDEO
		// =========================================

		let video = null;

		try {

			video = await getVideo();

		} catch (error) {

			console.error(
				"[PREFIX CONFIRM VIDEO ERROR]",
				error
			);
		}

		const replyData = {

			body: setGlobal
				? getLang("confirmGlobal")
				: getLang("confirmThisThread")

		};

		if (video) {
			replyData.attachment = video;
		}

		return message.reply(
			replyData,
			(err, info) => {

				if (err) {

					console.error(
						"[PREFIX REPLY ERROR]",
						err
					);

					return;
				}

				if (
					!info ||
					!info.messageID
				) {
					return;
				}

				global.GoatBot.onReaction.set(
					info.messageID,
					{
						commandName,
						author: event.senderID,
						threadID: event.threadID,
						newPrefix,
						setGlobal
					}
				);
			}
		);
	},

	// =========================================
	// REACTION
	// =========================================

	onReaction: async function ({
		event,
		message,
		threadsData,
		Reaction,
		getLang
	}) {

		try {

			if (!Reaction)
				return;

			if (
				event.userID !==
				Reaction.author
			)
				return;

			if (
				event.threadID !==
				Reaction.threadID
			)
				return;

			global.GoatBot.onReaction.delete(
				event.messageID
			);

			// =====================================
			// GLOBAL PREFIX
			// =====================================

			if (Reaction.setGlobal) {

				global.GoatBot.config.prefix =
					Reaction.newPrefix;

				fs.writeFileSync(
					global.client.dirConfig,
					JSON.stringify(
						global.GoatBot.config,
						null,
						2
					)
				);

				return message.reply(
					getLang(
						"successGlobal",
						Reaction.newPrefix
					)
				);
			}

			// =====================================
			// GROUP PREFIX
			// =====================================

			await threadsData.set(
				Reaction.threadID,
				Reaction.newPrefix,
				"data.prefix"
			);

			return message.reply(
				getLang(
					"successThisThread",
					Reaction.newPrefix
				)
			);

		} catch (error) {

			console.error(
				"[PREFIX REACTION ERROR]",
				error
			);

			return message.reply(
				"❌ Prefix পরিবর্তন করতে সমস্যা হয়েছে।"
			);
		}
	}
};
