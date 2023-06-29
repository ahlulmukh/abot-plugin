let handler = async (m, { conn, args }) => {
  if (!args[0]) throw "Masukan urlnya";
  let json = await api.fbdl(args[0]);
  json.result.map(async (v) => {
    conn.sendFile(m.chat, v, "", `Nih Medianya`, m);
    await conn.delay(1500);
  });
};

handler.help = ["facebook"];
handler.tags = ["downloader"];
handler.alias = ["fb", "fbdl", "facebook", "facebookdl"];
handler.command = /^((facebook|fb)(dl)?)$/i;
handler.exp = 3;
handler.limit = true;
module.exports = handler;
