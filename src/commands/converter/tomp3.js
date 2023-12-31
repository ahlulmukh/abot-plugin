const { toAudio } = require("../../lib/lib.converter");

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (m.quoted ? m.quoted : m.msg).mimetype || "";
  if (!/video|audio/.test(mime))
    throw `Balas video atau voice note yang ingin diubah ke mp3 dengan caption *${
      usedPrefix + command
    }*`;
  let media = await q.download();
  let audio = await toAudio(media, "mp4");
  await conn.sendMessage(
    m.chat,
    { audio: audio.data, mimetype: "audio/mpeg", fileName: `out.mp3` },
    { quoted: m }
  );
};
handler.help = ["tomp3"];
handler.tags = ["converter"];

handler.command = /^to(mp3|a(udio)?)$/i;

module.exports = handler;
