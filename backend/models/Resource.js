const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  courseName: { type: String, required: true },
  fileLink: { type: String, required: true },
  bookmarkedBy: { type: [String], default: [], index: true },  // ids of the users who bookmarked it
  createdBy: { type: String }  // rollno of the student or id of the teacher who added it
});

module.exports = mongoose.model("Resource", ResourceSchema);
