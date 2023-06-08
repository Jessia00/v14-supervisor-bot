const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  guildID: String,
  userID: String,
  gerekli: { type: Number, default: 100 },
  xp: { type: Number, default: 1 },
  level: { type: Number, default: 1 }
});

module.exports = mongoose.model("weatrix_level", levelSchema);