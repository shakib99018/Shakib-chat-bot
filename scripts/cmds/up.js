module.exports.config = {
  name: "up",
  version: "1.0.0",
  author: "Mohammad Maruf",
  aliases: ["uptime"],
  role: 0,
  category: "system"
};

const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports.onStart = async function ({ api, event }) {
  const started = Date.now();

  try {
    const formatUptime = (seconds) => {
      seconds = Math.floor(seconds);

      const days = Math.floor(seconds / 86400);
      seconds %= 86400;

      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;

      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;

      const parts = [];

      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${secs}s`);

      return parts.join(" ");
    };

    const getCPU = () => {
      try {
        const cpus = os.cpus();

        if (!cpus.length) return 0;

        let idle = 0;
        let total = 0;

        for (const cpu of cpus) {
          idle += cpu.times.idle;
          total +=
            cpu.times.user +
            cpu.times.nice +
            cpu.times.sys +
            cpu.times.idle +
            cpu.times.irq;
        }

        const usage = 100 - (idle / total) * 100;

        return Math.max(0, Math.min(100, usage));
      } catch (_) {
        return 0;
      }
    };

    const getDisk = () => {
      try {
        if (typeof fs.statfsSync !== "function") {
          return { used: 0, total: 0, percent: 0 };
        }

        const stat = fs.statfsSync("/");

        const total = Number(stat.blocks) * Number(stat.bsize);
        const free = Number(stat.bfree) * Number(stat.bsize);
        const used = total - free;

        return {
          used,
          total,
          percent: total > 0 ? (used / total) * 100 : 0
        };
      } catch (_) {
        return { used: 0, total: 0, percent: 0 };
      }
    };

    const roundRect = (ctx, x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const bubble = (ctx, x, y, r, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const cloud = (ctx, x, y, scale = 1) => {
      ctx.save();

      ctx.fillStyle = "#FFFFFF";
      ctx.globalAlpha = 0.72;

      ctx.beginPath();
      ctx.arc(x, y + 22 * scale, 30 * scale, 0, Math.PI * 2);
      ctx.arc(x + 34 * scale, y, 39 * scale, 0, Math.PI * 2);
      ctx.arc(x + 75 * scale, y + 20 * scale, 31 * scale, 0, Math.PI * 2);

      ctx.moveTo(x - 30 * scale, y + 22 * scale);
      ctx.quadraticCurveTo(
        x + 38 * scale,
        y + 58 * scale,
        x + 104 * scale,
        y + 23 * scale
      );

      ctx.lineTo(x + 104 * scale, y + 43 * scale);
      ctx.lineTo(x - 30 * scale, y + 43 * scale);
      ctx.closePath();

      ctx.fill();
      ctx.restore();
    };

    const drawSparkle = (ctx, x, y, size, color) => {
      ctx.save();
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.28, y - size * 0.28);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size * 0.28, y + size * 0.28);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.28, y + size * 0.28);
      ctx.lineTo(x - size, y);
      ctx.lineTo(x - size * 0.28, y - size * 0.28);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const width = 1280;
    const height = 760;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#E9F6FF");
    background.addColorStop(0.45, "#F0EBFF");
    background.addColorStop(1, "#FFF0F5");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    cloud(ctx, 75, 70, 1);
    cloud(ctx, 1010, 75, 1.25);
    cloud(ctx, 1110, 280, 0.55);

    bubble(ctx, 115, 300, 55, "#DCCFFF", 0.25);
    bubble(ctx, 1180, 500, 75, "#B9DFF7", 0.25);
    bubble(ctx, 1010, 580, 42, "#F5C9D9", 0.3);

    drawSparkle(ctx, 1050, 180, 10, "#C6B7F4");
    drawSparkle(ctx, 180, 180, 7, "#A8D5F0");
    drawSparkle(ctx, 1125, 330, 6, "#E6AFC5");

    ctx.save();

    ctx.shadowColor = "rgba(93, 77, 130, 0.16)";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 18;

    roundRect(ctx, 65, 55, 1150, 650, 48);

    const panel = ctx.createLinearGradient(65, 55, 1215, 705);
    panel.addColorStop(0, "rgba(255,255,255,0.94)");
    panel.addColorStop(1, "rgba(255,249,253,0.90)");

    ctx.fillStyle = panel;
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "#443A5B";
    ctx.font = "700 42px Sans";
    ctx.fillText("SHAKIB CHAT BOT", 115, 125);

    ctx.fillStyle = "#9389A6";
    ctx.font = "500 17px Sans";
    ctx.fillText("Live information", 118, 153);

    bubble(ctx, 1080, 115, 9, "#B8A8E7");

    ctx.fillStyle = "#8A80A0";
    ctx.font = "600 13px Sans";
    ctx.fillText("ONLINE", 1100, 120);

    const heroX = 115;
    const heroY = 185;
    const heroW = 1050;
    const heroH = 165;

    ctx.save();

    ctx.shadowColor = "rgba(114, 96, 155, 0.12)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 10;

    roundRect(ctx, heroX, heroY, heroW, heroH, 38);

    const hero = ctx.createLinearGradient(
      heroX,
      heroY,
      heroX + heroW,
      heroY + heroH
    );

    hero.addColorStop(0, "#DDF2FF");
    hero.addColorStop(0.5, "#EDE5FF");
    hero.addColorStop(1, "#FFE7F0");

    ctx.fillStyle = hero;
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "#817596";
    ctx.font = "600 15px Sans";
    ctx.fillText("RUNNING FOR", 155, 228);

    ctx.fillStyle = "#403652";
    ctx.font = "700 48px Sans";
    ctx.fillText(
      formatUptime(process.uptime()),
      155,
      282
    );

    ctx.fillStyle = "#9489A7";
    ctx.font = "500 16px Sans";
    ctx.fillText("process uptime", 158, 313);

    bubble(ctx, 1030, 260, 50, "#FFFFFF", 0.55);
    bubble(ctx, 1080, 285, 32, "#FFFFFF", 0.42);
    bubble(ctx, 990, 290, 25, "#FFFFFF", 0.35);

    drawSparkle(ctx, 1075, 230, 9, "#B39DEB");

    const response = Date.now() - started;
    const cpu = getCPU();

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const ramPercent =
      totalMemory > 0
        ? (usedMemory / totalMemory) * 100
        : 0;

    const disk = getDisk();

    const cards = [
      {
        x: 115,
        title: "RESPONSE",
        value: `${response} ms`,
        bg: "#FFF0E5",
        dot: "#E8AE80"
      },
      {
        x: 380,
        title: "CPU",
        value: `${cpu.toFixed(1)}%`,
        bg: "#EAE5FF",
        dot: "#9E8BD7"
      },
      {
        x: 645,
        title: "RAM",
        value: `${ramPercent.toFixed(1)}%`,
        bg: "#E4F3FF",
        dot: "#82B8D8"
      },
      {
        x: 910,
        title: "DISK",
        value: `${disk.percent.toFixed(1)}%`,
        bg: "#FFE8F0",
        dot: "#D89AB4"
      }
    ];

    cards.forEach((card) => {
      ctx.save();

      ctx.shadowColor = "rgba(105, 88, 130, 0.09)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 9;

      roundRect(ctx, card.x, 385, 235, 120, 30);

      ctx.fillStyle = card.bg;
      ctx.fill();

      ctx.restore();

      bubble(ctx, card.x + 28, 415, 6, card.dot);

      ctx.fillStyle = "#827791";
      ctx.font = "600 12px Sans";
      ctx.fillText(card.title, card.x + 43, 420);

      ctx.fillStyle = "#463B58";
      ctx.font = "700 27px Sans";
      ctx.fillText(card.value, card.x + 25, 463);

      ctx.fillStyle = "#A39AAD";
      ctx.font = "500 12px Sans";

      if (card.title === "RAM") {
        ctx.fillText(
          `${Math.round(usedMemory / 1024 / 1024)} MB used`,
          card.x + 25,
          486
        );
      } else if (card.title === "DISK") {
        ctx.fillText(
          `${Math.round(disk.used / 1024 / 1024 / 1024)} GB used`,
          card.x + 25,
          486
        );
      } else {
        ctx.fillText("current value", card.x + 25, 486);
      }
    });

    const details = [
      ["PLATFORM", process.platform],
      ["NODE", process.version],
      ["CORES", String(os.cpus().length)],
      ["LOAD", (os.loadavg()[0] || 0).toFixed(2)]
    ];

    details.forEach((item, index) => {
      const x = 115 + index * 265;

      ctx.fillStyle = "#978CA9";
      ctx.font = "600 11px Sans";
      ctx.fillText(item[0], x, 548);

      ctx.fillStyle = "#554967";
      ctx.font = "600 17px Sans";
      ctx.fillText(item[1], x, 578);
    });

    ctx.save();

    ctx.globalAlpha = 0.8;

    ctx.fillStyle = "#D9CEFA";
    ctx.beginPath();
    ctx.ellipse(135, 650, 70, 25, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#C9E7FA";
    ctx.beginPath();
    ctx.ellipse(235, 660, 100, 27, 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#F4D4E0";
    ctx.beginPath();
    ctx.ellipse(1090, 650, 95, 26, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    drawSparkle(ctx, 320, 630, 6, "#B5A3E9");
    drawSparkle(ctx, 930, 625, 8, "#D9A8BE");

    const now = new Date();

    const dateText = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const timeText = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    ctx.fillStyle = "#A097A9";
    ctx.font = "500 12px Sans";
    ctx.fillText(
      `${dateText}  •  ${timeText}`,
      115,
      670
    );

    const filePath = path.join(
      __dirname,
      `uptime_${Date.now()}.png`
    );

    fs.writeFileSync(
      filePath,
      canvas.toBuffer("image/png")
    );

    await api.sendMessage(
      {
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      },
      event.messageID
    );
  } catch (_) {}
};