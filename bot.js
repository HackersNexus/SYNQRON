const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode");
const pino = require("pino");
const express = require("express");
const cors = require("cors");

let currentQR = null;

// ─────────────────────────────────────
// 🔌 Express Server to Serve QR
// ─────────────────────────────────────
const app = express();
app.use(cors());

app.get("/qr", async (req, res) => {
  if (!currentQR) return res.status(404).json({ error: "QR not available" });

  try {
    const qrDataURL = await qrcode.toDataURL(currentQR);
    res.json({ qr: qrDataURL });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

app.listen(3000, () => {
  console.log(" QR Server running at http://localhost:3000/qr");
});

// ─────────────────────────────────────
// 🤖 WhatsApp Bot Function
// ─────────────────────────────────────
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // QR Code & Connection
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      console.log(" QR code updated. Open http://localhost:3000/qr to scan.");
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(' Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log(' Bot connected to WhatsApp!');
      currentQR = null; // QR is no longer needed
    }
  });

  // Log all messages (sent + received)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const senderName = msg.pushName || 'Unknown';

    const messageContent =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      msg.message.documentMessage?.caption ||
      '[Media]';

    const direction = msg.key.fromMe ? "🟢 Sent" :" Received";
    console.log(`${direction} message ${msg.key.fromMe ? "to" : "from"} ${senderName} (${sender}): ${messageContent}`);
  });
}

startBot();
