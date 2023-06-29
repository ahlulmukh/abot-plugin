let handler = async (m, { conn, args }) => {
  if (!args || !args[0]) return conn.reply(m.chat, "Uhm... urlnya mana?", m);
  if (
    !/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(
      args[0]
    )
  )
    return conn.reply(m.chat, "youtube only", m);
  const json = await Func.fetchJson(
    "https://yt.nxr.my.id/yt2?url=" + args[0] + "&type=video"
  );
  if (!json.status || !json.data.url) return conn.reply(m.chat, eror, m);
  await m.reply(wait);
  let caption = `乂  *YT VIDEO*\n\n`;
  caption += `	◦  *Title* : ${json.title}\n`;
  caption += `	◦  *Channel* : ${json.channel}\n`;
  caption += `	◦  *Published* : ${json.publish}\n`;
  caption += `	◦  *views* : ${json.views}\n\n`;
  caption += global.footer;
  conn
    .sendMessageModify(m.chat, caption, m, {
      largeThumb: true,
      thumbnail: await Func.fetchBuffer(json.thumbnail),
    })
    .then(async () => {
      conn.sendFile(m.chat, json.data.url, "", "", m);
    });
};
handler.help = ["ytmp4"];
handler.tags = ["downloader"];
handler.command = /^yt(v(idi?e?o)?|mp4)?$/i;
handler.exp = 3;
handler.limit = true;
module.exports = handler;
