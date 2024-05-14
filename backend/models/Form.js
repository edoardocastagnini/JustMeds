const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  orderNumber: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

const Form = mongoose.model("Form", contactRequestSchema, "form_requests");

module.exports = Form;
