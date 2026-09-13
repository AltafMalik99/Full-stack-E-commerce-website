import Contact from "../models/Contact.js";
import { createNotification } from "./notificationController.js";

// POST /api/contact — public, customer submits a support message
export async function submitContact(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are all required." });
    }

    const contact = await Contact.create({ name, email, message });
    createNotification("new_message", `New support message from ${name}`).catch(() => {});

    res.status(201).json({ message: "Your message has been received. We'll get back to you soon." , contact});
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/contacts
export async function getContacts(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { message: new RegExp(search, "i") },
      ];
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json({ count: contacts.length, contacts });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/contacts/:id/status
export async function updateContactStatus(req, res, next) {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ message: "Message not found." });
    res.json({ message: "Status updated", contact });
  } catch (err) {
    next(err);
  }
}
