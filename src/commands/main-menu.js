let levelling = require("../lib/lib.levelling");
let fs = require("fs");
let path = require("path");
let fetch = require("node-fetch");
let moment = require("moment-timezone");
let totalf = Object.values(global.plugins).filter(
  (v) => v.help && v.tags
).length;
let nom = 1;
const defaultMenu = {
  before: `𝗜𝗡𝗙𝗢 𝗣𝗘𝗡𝗚𝗚𝗨𝗡𝗔
🎫Limit: *%limit*
🥋Role: *%role*
🎚Level: *%level*
💵Money: *%money*

𝗜𝗡𝗙𝗢 𝗕𝗢𝗧
⏳Uptime: *%uptime*
🗂Registrasi: *%rtotalreg user*
📁Belum Registrasi: *%totalreg user*
⚠️Mode: *${global.opts["self"] ? "Self" : "Publik"}*
📊Database: *MongoDB*
`,
  header: "┌──⭓ *%category*",
  body: "│⎚ %cmd",
  footer: "└───────⭓",
  after: `│`,
};
let handler = async (m, { conn, usedPrefix: _p, args, command }) => {
  let tags = {
    anonymous: "MENU ANONYMOUS",
    ai: "AI MENU",
    internet: "MENU INTERNET",
    downloader: "MENU DOWNLOADER",
    database: "MENU DATABASE",
    game: "MENU GAME",
    rpg: "MENU RPG",
    owner: "MENU OWNER",
    xp: "MENU XP",
    sticker: "MENU STIKER",
    jadian: "MENU JADIAN",
    islami: "MENU ISLAMI",
    group: "MENU GROUP",
    tools: "MENU TOOLS",
    info: "MENU INFO",
  };

  try {
    let package = JSON.parse(
      await fs.promises
        .readFile(path.join(__dirname, "../package.json"))
        .catch((_) => "{}")
    );
    let { exp, limit, age, money, level, role, registered } =
      global.db.data.users[m.sender];
    let { min, xp, max } = levelling.xpRange(level, global.multiplier);
    let umur = `*${age == "-1" ? "Belum Daftar*" : age + "* Thn"}`;
    let name = registered
      ? global.db.data.users[m.sender].name
      : conn.getName(m.sender);
    let d = new Date(new Date() + 3600000);
    let locale = "id";
    let weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
      Math.floor(d / 84600000) % 5
    ];
    let week = d.toLocaleDateString(locale, { weekday: "long" });
    let date = d.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    let dateIslamic = Intl.DateTimeFormat(locale + "-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    let time = d.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    let _uptime = process.uptime() * 1000;
    let _muptime;
    if (process.send) {
      process.send("uptime");
      _muptime =
        (await new Promise((resolve) => {
          process.once("message", resolve);
          setTimeout(resolve, 1000);
        })) * 1000;
    }
    let muptime = clockString(_muptime);
    let uptime = clockString(_uptime);
    global.jam = time;
    let totalreg = Object.keys(global.db.data.users).length;
    let rtotalreg = Object.values(global.db.data.users).filter(
      (user) => user.registered == true
    ).length;
    let help = Object.values(global.plugins)
      .filter((plugin) => !plugin.disabled)
      .map((plugin) => {
        return {
          help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
          tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
          prefix: "customPrefix" in plugin,
          limit: plugin.limit,
          premium: plugin.premium,
          enabled: !plugin.disabled,
        };
      });
    let groups = {};
    for (let tag in tags) {
      groups[tag] = [];
      for (let plugin of help)
        if (plugin.tags && plugin.tags.includes(tag))
          if (plugin.help) groups[tag].push(plugin);
    }
    conn.menu = conn.menu ? conn.menu : {};
    let before = conn.menu.before || defaultMenu.before;
    let header = conn.menu.header || defaultMenu.header;
    let body = conn.menu.body || defaultMenu.body;
    let footer = conn.menu.footer || defaultMenu.footer;
    let after =
      conn.menu.after ||
      (conn.user.jid == global.conn.user.jid
        ? ""
        : `Dipersembahkan oleh https://wa.me/${
            global.conn.user.jid.split`@`[0]
          }`) + defaultMenu.after;
    let _text = [
      before,
      ...Object.keys(tags).map((tag) => {
        return (
          header.replace(/%category/g, tags[tag]) +
          "\n" +
          [
            ...help
              .filter(
                (menu) => menu.tags && menu.tags.includes(tag) && menu.help
              )
              .map((menu) => {
                return menu.help
                  .map((help) => {
                    return body
                      .replace(/%cmd/g, menu.prefix ? help : "%p" + help)
                      .replace(/%islimit/g, menu.limit ? "*(Limit)*" : "")
                      .replace(/%isPremium/g, menu.premium ? "*(Premium)*" : "")
                      .trim();
                  })
                  .join("\n");
              }),
            footer,
          ].join("\n")
        );
      }),
      after,
    ].join("\n");
    text =
      typeof conn.menu == "string"
        ? conn.menu
        : typeof conn.menu == "object"
        ? _text
        : "";
    let replace = {
      "%": "%",
      ucapan: global.ucapan,
      p: _p,
      uptime,
      muptime,
      me: conn.user.name,
      npmname: package.name,
      npmdesc: package.description,
      version: package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup:
        max - exp <= 0
          ? `Siap untuk *${_p}levelup*`
          : `${max - exp} XP lagi untuk levelup`,
      github: package.homepage
        ? package.homepage.url || package.homepage
        : "[unknown github url]",
      level,
      limit,
      name,
      umur,
      money,
      age,
      weton,
      week,
      date,
      dateIslamic,
      time,
      totalreg,
      rtotalreg,
      totalf,
      role,
      readmore: readMore,
    };
    text = text.replace(
      new RegExp(
        `%(${Object.keys(replace).sort((a, b) => b.length - a.length)
          .join`|`})`,
        "g"
      ),
      (_, name) => "" + replace[name]
    );
    conn.sendMessageModify(m.chat, text.trim(), m, {
      ads: false,
      largeThumb: true,
      url: "https://chat.whatsapp.com/LMSaRzwUmYFAMDLV6mQnv7",
    });
  } catch (e) {
    conn.reply(m.chat, "Maaf, menu sedang error", m);
    throw e;
  }
};
handler.help = ["menu", "help", "?"];
handler.tags = ["main"];
handler.command = /^(m(enu)?|help|\?)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;

handler.admin = false;
handler.botAdmin = false;

handler.fail = null;
handler.exp = 3;

module.exports = handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function clockString(ms) {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}
function ucapan() {
  const time = moment.tz("Asia/Jakarta").format("HH");
  res = "Selamat dinihari";
  if (time >= 4) {
    res = "Selamat pagi, jangan lupa sahurnya";
  }
  if (time > 10) {
    res = "Selamat siang, semangat ya puasanya ";
  }
  if (time >= 15) {
    res = "Selamat sore, selamat ngabuburit";
  }
  if (time >= 18) {
    res = "Selamat malam, jangan lupa tadarus dan berdoa";
  }
  return res;
}
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}
function thumbnya() {
  const time = moment.tz("Asia/Jakarta").format("HH");
  //res = "https://telegra.ph/file/17699a0df2cb4adcf1ab3.jpg"
  res =
    "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=800&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23ffffff&fillColor2Color=%23ffffff&fillColor3Color=%23ffffff&fillColor4Color=%23ffffff&fillColor5Color=%23ffffff&fillColor6Color=%23ffffff&fillColor7Color=%23ffffff&fillColor8Color=%23ffffff&fillColor9Color=%23ffffff&fillColor10Color=%23ffffff&fillOutlineColor=%23ffffff&fillOutline2Color=%23ffffff&backgroundColor=%23101820&text=Selamat+Dinihari";
  if (time >= 4) {
    //res = "https://telegra.ph/file/1755d29aa25fa31114a8d.jpg"
    res =
      "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=800&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23ffffff&fillColor2Color=%23ffffff&fillColor3Color=%23ffffff&fillColor4Color=%23ffffff&fillColor5Color=%23ffffff&fillColor6Color=%23ffffff&fillColor7Color=%23ffffff&fillColor8Color=%23ffffff&fillColor9Color=%23ffffff&fillColor10Color=%23ffffff&fillOutlineColor=%23ffffff&fillOutline2Color=%23ffffff&backgroundColor=%23101820&text=Selamat+Pagi";
  }
  if (time > 10) {
    // res = "https://telegra.ph/file/6f56042e46beec03644c1.jpg"
    res =
      "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=800&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23ffffff&fillColor2Color=%23ffffff&fillColor3Color=%23ffffff&fillColor4Color=%23ffffff&fillColor5Color=%23ffffff&fillColor6Color=%23ffffff&fillColor7Color=%23ffffff&fillColor8Color=%23ffffff&fillColor9Color=%23ffffff&fillColor10Color=%23ffffff&fillOutlineColor=%23ffffff&fillOutline2Color=%23ffffff&backgroundColor=%23101820&text=Selamat+Siang";
  }
  if (time >= 15) {
    //res = "https://telegra.ph/file/1b3a9f4ecdbcabec4564d.jpg"
    res =
      "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=800&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23ffffff&fillColor2Color=%23ffffff&fillColor3Color=%23ffffff&fillColor4Color=%23ffffff&fillColor5Color=%23ffffff&fillColor6Color=%23ffffff&fillColor7Color=%23ffffff&fillColor8Color=%23ffffff&fillColor9Color=%23ffffff&fillColor10Color=%23ffffff&fillOutlineColor=%23ffffff&fillOutline2Color=%23ffffff&backgroundColor=%23101820&text=Selamat+Sore";
  }
  if (time >= 18) {
    //res = "https://telegra.ph/file/4785affdb1c08575c598a.jpg"
    res =
      "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=800&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23ffffff&fillColor2Color=%23ffffff&fillColor3Color=%23ffffff&fillColor4Color=%23ffffff&fillColor5Color=%23ffffff&fillColor6Color=%23ffffff&fillColor7Color=%23ffffff&fillColor8Color=%23ffffff&fillColor9Color=%23ffffff&fillColor10Color=%23ffffff&fillOutlineColor=%23ffffff&fillOutline2Color=%23ffffff&backgroundColor=%23101820&text=Selamat+Malam";
  }
  return res;
}
