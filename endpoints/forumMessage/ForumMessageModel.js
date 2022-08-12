var mongoose = require('mongoose');

const ForumMessageSchema = new mongoose.Schema({
    id: Number,
    forumThreadID: String,
    title: String,
    text: String,
    authorID: { type: String, required: true },
}, { timestamps: true });

const ForumMessage = mongoose.model("ForumMessage", ForumMessageSchema);

module.exports = ForumMessage;