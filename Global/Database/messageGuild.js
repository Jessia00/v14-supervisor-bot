const { Schema, model } = require("mongoose");

const schema = Schema({
  guildID: { type: String, default: "" },
  dailyStat: { type: Number, default: 0 },
  weeklyStat: { type: Number, default: 0 },
  twoWeeklyStat: { type: Number, default: 0 },
  totalStat: { type: Number, default: 0 },
});

module.exports = model("weatrix_messageGuild", schema);
