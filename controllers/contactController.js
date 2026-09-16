import ContactMessage from "../models/ContactMessage.js";

/*
=========================================================
CREATE CONTACT MESSAGE
=========================================================
*/

export const createContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    // Check required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, subject and message are required.",
      });
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactMessage,
    });
  } catch (error) {
    console.error("Create Contact Message Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send your message.",
    });
  }
};


/*
=========================================================
ADMIN - GET CONTACT MESSAGES
=========================================================
*/

export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Contact Messages Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch contact messages.",
    });
  }
};


/*
=========================================================
ADMIN - UPDATE CONTACT MESSAGE STATUS
=========================================================
*/

export const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "New",
      "Read",
      "Replied",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message status.",
      });
    }

    const contactMessage =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message status updated successfully.",
      contactMessage,
    });
  } catch (error) {
    console.error(
      "Update Contact Message Status Error:",
      error
    );

    res.status(400).json({
      success: false,
      message: "Unable to update contact message status.",
    });
  }
};