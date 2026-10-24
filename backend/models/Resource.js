const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  courseName: { type: String, required: true },
  fileLink: { type: String, required: true },
  bookmarked: { type: Boolean, default: false, index: true },  // New field for bookmarking and added index
  createdBy: { type: String }  // rollno of the student or id of the teacher who added it
});

module.exports = mongoose.model("Resource", ResourceSchema);
