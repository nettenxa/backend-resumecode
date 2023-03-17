const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema(
  {
  Goal: {
    type: String
  },
  Lost: {
    type: String
  },
  Team: {
    type: String
  },
  Code: {
    type: String
  }
});

module.exports = Team = mongoose.model('team', TeamSchema);
