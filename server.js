const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static files (HTML, CSS, JS) from project root
app.use(express.static(path.join(__dirname)));

// Allow cross-origin requests (useful when serving HTML from Live Server / another port)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple health check endpoint (use to verify server is running)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Configure your email transport (only once)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'businessmia23@gmail.com', // Your Gmail address
    pass: 'tsaqnawrlforsnyj', // Your Gmail app password
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer verify failed:', error);
  } else {
    console.log('Nodemailer is ready to send messages');
  }
});

app.post('/contact', upload.array('files[]'), async (req, res) => {
  const { name, email, message } = req.body;
  const files = req.files;

  console.log('Contact form submitted:', { name, email, message: message?.slice(0, 50), files: files?.length });

  const mailOptions = {
    from: `"${name}" <businessmia23@gmail.com>`,
    to: 'businessmia23@gmail.com', // Your receiving email
    replyTo: email,
    subject: `Contact Form Submission from ${name} (${email}) - ${new Date().toLocaleString()}`,
    text:
      `New contact form submission\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Message: ${message}\n` +
      (files && files.length > 0
        ? `\nAttached files:\n${files.map(f => '- ' + f.originalname).join('\n')}`
        : ''),
    attachments: files && files.length > 0
      ? files.map(f => ({ filename: f.originalname, path: f.path }))
      : [],
    messageId: `<${Date.now()}-${Math.random().toString(36).substring(2)}@issvarvning.com>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    // Delete uploaded files after sending
    if (files && files.length > 0) {
      files.forEach(f => fs.unlinkSync(f.path));
    }
    res.status(200).send('Message sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending message. See server logs for details.');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
