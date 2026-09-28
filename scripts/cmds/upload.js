const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

module.exports = {
  config: {
    name: "uguu",
    aliases: ["upload", "upfile"],
    version: "1.0.0",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: "Upload replied media",
    longDescription: "Upload replied image, video or audio and get a direct link",
    guide: "{pn} - Reply to image/video/audio"
  },

  onStart: async function (o) {
    var event = o.event;
    var api = o.api;
    var message = o.message;

    var reply = event.messageReply;

    if (!reply) {
      return message.reply(
        "⚠️ | একটি ছবি, ভিডিও অথবা অডিওতে Reply করে `uguu` লিখুন।"
      );
    }

    if (!reply.attachments || reply.attachments.length == 0) {
      return message.reply(
        "❌ | Reply করা মেসেজে কোনো media পাওয়া যায়নি।"
      );
    }

    var attachment = reply.attachments[0];

    var url =
      attachment.url ||
      attachment.facebookUrl ||
      attachment.uri;

    if (!url) {
      return message.reply(
        "❌ | Media download URL পাওয়া যায়নি।"
      );
    }

    var ext = ".dat";

    if (attachment.type == "photo") {
      ext = ".jpg";
    } else if (attachment.type == "video") {
      ext = ".mp4";
    } else if (attachment.type == "audio") {
      ext = ".mp3";
    }

    var filePath = path.join(
      __dirname,
      "uguu_" + Date.now() + ext
    );

    var loading = null;

    try {

      try {
        api.setMessageReaction(
          "⏳",
          event.messageID,
          function () {},
          true
        );
      } catch (e) {}

      loading = await message.reply(
        "📤 | Upload হচ্ছে...\n" +
        "⏳ | একটু অপেক্ষা করুন..."
      );

      /*
       * Download media
       */
      var download = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Accept": "*/*"
        }
      });

      if (!download || !download.data) {
        throw new Error("Media download failed.");
      }

      fs.writeFileSync(
        filePath,
        Buffer.from(download.data)
      );

      if (!fs.existsSync(filePath)) {
        throw new Error("Temporary file তৈরি হয়নি।");
      }

      var fileSize = fs.statSync(filePath).size;

      if (fileSize <= 0) {
        throw new Error("Downloaded file empty.");
      }

      /*
       * Uguu Form
       */
      var form = new FormData();

      form.append(
        "files[]",
        fs.createReadStream(filePath)
      );

      /*
       * Upload
       */
      var upload = await axios({
        method: "POST",
        url: "https://uguu.se/upload.php",
        data: form,
        headers: form.getHeaders(),
        timeout: 180000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      var data = upload.data;

      console.log("UGUU RESPONSE:");
      console.log(data);

      var link = "";

      if (
        data &&
        data.files &&
        data.files.length > 0
      ) {
        link = data.files[0].url;
      }

      if (!link) {
        throw new Error(
          "Upload server কোনো link দেয়নি।"
        );
      }

      /*
       * Delete temporary file
       */
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      try {
        api.setMessageReaction(
          "✅",
          event.messageID,
          function () {},
          true
        );
      } catch (e) {}

      return message.reply(
        "╭──────────────╮\n" +
        "   ✅ UPLOAD SUCCESS\n" +
        "╰──────────────╯\n\n" +
        "🔗 Direct Link:\n" +
        link
      );

    } catch (err) {

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }

      try {
        api.setMessageReaction(
          "❌",
          event.messageID,
          function () {},
          true
        );
      } catch (e) {}

      var errorText = "Unknown error";

      if (err && err.message) {
        errorText = String(err.message);
      }

      console.log(
        "========== UGUU ERROR =========="
      );
      console.log(errorText);

      if (err && err.response) {
        console.log(
          "STATUS:",
          err.response.status
        );
        console.log(
          "DATA:",
          err.response.data
        );
      }

      console.log(
        "==============================="
      );

      return message.reply(
        "❌ | Upload Failed!\n\n" +
        "🔎 Error: " +
        errorText
      );

    } finally {

      if (
        loading &&
        loading.messageID
      ) {
        setTimeout(function () {
          try {
            api.unsendMessage(
              loading.messageID,
              function () {}
            );
          } catch (e) {}
        }, 3000);
      }
    }
  }
};
