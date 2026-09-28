const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sexvideo",
    aliases: ["sexvid"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 2,
    description: {
      en: "Send a random video."
    },
    category: "18+",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { messageID, threadID } = event;

    const CACHE_DIR = path.join(__dirname, "cache");
    const MAX_RETRIES = 3;

    const links = [
      "https://drive.google.com/uc?export=download&id=1-gJdG8bxmZLyOC7-6E4A5Hm95Q9gWIPO",
      "https://drive.google.com/uc?export=download&id=1-ryNR8j529EZyTCuMur9wmkFz4ahlv-f",
      "https://drive.google.com/uc?export=download&id=1-vHh7XBtPOS3s42q-s8s30Bzsx2u6czu",
      "https://drive.google.com/uc?export=download&id=11IUd-PDHozLmh_RtvSf0S-f3G6wut1ZT",
      "https://drive.google.com/uc?export=download&id=12YCqZovJ8sVZZZTDLu8dv8NAwsMGfqiB",
      "https://drive.google.com/uc?export=download&id=12eIiCYpd_Jm8zIVRSkqlSt7W-7OsxB6g",
      "https://drive.google.com/uc?export=download&id=13utWruipZ_3fR0QSMtGMnFjGt3bthnbf",
      "https://drive.google.com/uc?export=download&id=14GYNaYL-pkEh3UH0oIUXVamru5h830DY",
      "https://drive.google.com/uc?export=download&id=14UGb2fH4wyUbVSQ-Vt5yf-4sH3-icXGC",
      "https://drive.google.com/uc?export=download&id=161O9_EbCQJ8nHTT7VeE7BWtHvEjHAT4k",
      "https://drive.google.com/uc?export=download&id=170YWB4jpMfR5GpmPb_Lymh6OmrmWDE0x",
      "https://drive.google.com/uc?export=download&id=17nvXNBpMWVmuWLK-kkLzkbrbpW43rD4r",
      "https://drive.google.com/uc?export=download&id=17w7sehThOv6IRrcsLboi7Zk6zZvfBHr5",
      "https://drive.google.com/uc?export=download&id=17yaPd3PoYJkuL0IEZHzcBic9pX4AmGiK",
      "https://drive.google.com/uc?export=download&id=18Dyc1vkysNhHSGi5OYpa6AzD5rk3_vkf",
      "https://drive.google.com/uc?export=download&id=18brau5aYmiMAxfhDTLz_nFWuIcb_mja5",
      "https://drive.google.com/uc?export=download&id=19GcLpOzFYypYFu1FboQyVjWxC9Jh3JC5",
      "https://drive.google.com/uc?export=download&id=19lKQChg0hv2MOTphkyI4zTiUIxuujd03",
      "https://drive.google.com/uc?export=download&id=1AjrBOBRWKpKjLOYV1oof2mVZBzx0ebgD",
      "https://drive.google.com/uc?export=download&id=1BPOEwIt7lGv66w5pUTDU937q4i5ym5S_",
      "https://drive.google.com/uc?export=download&id=1C-VxCoO5gMKCq2rg7PxjlitK4bOg7pt2",
      "https://drive.google.com/uc?export=download&id=1C9t9VNpLT9DelBeDnbFNjdAA0tK_cXh-",
      "https://drive.google.com/uc?export=download&id=1DrhAOOeYIHlTWJU5e26OMjO0R5nueyf7",
      "https://drive.google.com/uc?export=download&id=1Dz7UfOejW9rDFYFAtxmAq_ncv04WaTTL",
      "https://drive.google.com/uc?export=download&id=1EcBmrdqYfQbwSPr2kiKY2QV_6CXLJJj6",
      "https://drive.google.com/uc?export=download&id=1F5Xc5Qff4RGyUuHzuqPfmOn2EZKQIn7P",
      "https://drive.google.com/uc?export=download&id=1FTxkmgt2sWf8U2h8a5HszyKINMr6Gnwm",
      "https://drive.google.com/uc?export=download&id=1Frf4GUg26Abw2lJdQ_RHycNhDMZXfMm2",
      "https://drive.google.com/uc?export=download&id=1FtdiGL244Kcj7tiA6F_2mKeTmMpVCyjr",
      "https://drive.google.com/uc?export=download&id=1G2tE1VdFzzqochfGwXwc46nuwkTeRRSc",
      "https://drive.google.com/uc?export=download&id=1GB6VOhgA3-JUSUZ3D1xgjlKH1Jswy0Z4",
      "https://drive.google.com/uc?export=download&id=1G_04XtbUP-QZNWFzdLohwY_w6BRdmijk",
      "https://drive.google.com/uc?export=download&id=1GpvlwryNcsRz2i6VYEV3NqSLr0WtGGn_",
      "https://drive.google.com/uc?export=download&id=1HYn-ZCVB0JcipKWrMxPnSrAVP4oSjePT",
      "https://drive.google.com/uc?export=download&id=1H_5i2V6W8Fl0N5QIKPACEUcljd8-q_dT",
      "https://drive.google.com/uc?export=download&id=1HhFPMOMXI7DDKc371C-12A0yfC0101x7",
      "https://drive.google.com/uc?export=download&id=1JNRfPMJe1_SodueqhMVf4so0-vjWaK9V",
      "https://drive.google.com/uc?export=download&id=1Jjy85bIGE9efsUIlmHykEistAquEB9oT",
      "https://drive.google.com/uc?export=download&id=1JoXCYZz4YoKpWe809ttUaaSsJdsCJZNf",
      "https://drive.google.com/uc?export=download&id=1Ko-ScBYddulpKX4I4xS7BRkndIaZZ3gT",
      "https://drive.google.com/uc?export=download&id=1LU4PTBFjWlhgzP2HiiJX_Esw2iIq7Zpj",
      "https://drive.google.com/uc?export=download&id=1LaM2kIlZUdA_UbCzX8s92nxcqEJieHLN",
      "https://drive.google.com/uc?export=download&id=1LcClA0b5Qih_tIv_wVRUsWX9gk3bVmzj",
      "https://drive.google.com/uc?export=download&id=1LgVpbMhe0CXM7rIUr9pJNK46QtZcpRtK",
      "https://drive.google.com/uc?export=download&id=1MB-KTUmPMkSb1o4J_EIRQ8mJ3w-cUOtY",
      "https://drive.google.com/uc?export=download&id=1M_cHjSaNWT5b_8p9VSPmzVyz-rqBqo3S",
      "https://drive.google.com/uc?export=download&id=1NC3fFj68PqqvZeg67AdA_cHyNdOBlRfF",
      "https://drive.google.com/uc?export=download&id=1Nk534yO5owt7IaMOKjbT6IGLGW96Gv0f",
      "https://drive.google.com/uc?export=download&id=1O1Cej8MFdytRun3RmGTnmT6uk1T-Zcmu"
    ];

    api.setMessageReaction("⏰", messageID, () => {}, true);

    let waitMsg = null;

    try {
      waitMsg = await new Promise((resolve, reject) => {
        api.sendMessage(
          "🙊__Tham Video dicchi Reehh -!💫💋",
          threadID,
          (err, info) => {
            if (err) return reject(err);
            resolve(info);
          }
        );
      });

      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }

      if (!global.videoQueue || global.videoQueue.length === 0) {
        global.videoQueue = [...links];

        for (let i = global.videoQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));

          [global.videoQueue[i], global.videoQueue[j]] = [
            global.videoQueue[j],
            global.videoQueue[i]
          ];
        }
      }

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        let filePath = null;

        try {
          const videoUrl = global.videoQueue.pop();

          filePath = path.join(
            CACHE_DIR,
            `video_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`
          );

          const response = await axios({
            method: "GET",
            url: videoUrl,
            responseType: "stream",
            maxRedirects: 10,
            timeout: 60000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
            }
          });

          const writer = fs.createWriteStream(filePath);

          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
            response.data.on("error", reject);
          });

          const stats = await fs.stat(filePath);

          if (!stats.size || stats.size < 1024) {
            throw new Error("Downloaded file is empty or invalid.");
          }

          api.setMessageReaction("✅", messageID, () => {}, true);

          await new Promise((resolve, reject) => {
            api.sendMessage(
              {
                attachment: fs.createReadStream(filePath)
              },
              threadID,
              (err, info) => {
                if (err) return reject(err);
                resolve(info);
              }
            );
          });

          if (waitMsg?.messageID) {
            api.unsendMessage(waitMsg.messageID, () => {});
          }

          setTimeout(() => {
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (e) {}
          }, 5000);

          return;

        } catch (error) {
          console.error(
            `VIDEO ATTEMPT ${attempt} ERROR:`,
            error.message
          );

          if (filePath && fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {}
          }

          if (attempt < MAX_RETRIES) {
            await new Promise(resolve =>
              setTimeout(resolve, 500 * attempt)
            );
          }
        }
      }

      api.setMessageReaction("❌", messageID, () => {}, true);

      if (waitMsg?.messageID) {
        api.unsendMessage(waitMsg.messageID, () => {});
      }

      return message.reply(
        "❌ 𝐕𝐢𝐝𝐞𝐨 𝐬𝐞𝐧𝐝 𝐤𝐨𝐫𝐚 𝐠𝐞𝐥𝐨 𝐧𝐚।\n🔄 𝐀𝐛𝐚𝐫 𝐭𝐫𝐲 𝐤𝐨𝐫𝐨।"
      );

    } catch (error) {
      console.error("VIDEO COMMAND ERROR:", error);

      api.setMessageReaction("❌", messageID, () => {}, true);

      if (waitMsg?.messageID) {
        api.unsendMessage(waitMsg.messageID, () => {});
      }

      return message.reply(
        "❌ 𝐕𝐢𝐝𝐞𝐨 𝐬𝐞𝐧𝐝 𝐤𝐨𝐫𝐚 𝐠𝐞𝐥𝐨 𝐧𝐚।"
      );
    }
  }
};
