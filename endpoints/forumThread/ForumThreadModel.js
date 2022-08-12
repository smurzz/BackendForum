var mongoose = require('mongoose');

const ForumThreadSchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String,
    ownerID: { type: String, required: true },
}, { timestamps: true });

const ForumThread = mongoose.model("ForumThread", ForumThreadSchema);

module.exports = ForumThread;