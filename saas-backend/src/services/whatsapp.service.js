const { getTwilioClient, isTwilioConfigured } = require('../config/twilio');
const { env } = require('../config/env');

/**
 * Send WhatsApp message via Twilio if configured.
 * If not configured, we "mock send" and return a fake message id.
 */
async function sendWhatsAppMessage({ toPhoneE164, body }) {
  // Twilio WhatsApp requires prefix whatsapp:+E164
  const to = toPhoneE164.startsWith('whatsapp:') ? toPhoneE164 : `whatsapp:${toPhoneE164}`;

  if (!isTwilioConfigured()) {
    // Mock mode (dev-friendly)
    // eslint-disable-next-line no-console
    console.log('[WHATSAPP] Twilio not configured, running in MOCK mode', {
      to,
      from: env.twilio.whatsappFrom,
      hasAccountSid: Boolean(env.twilio.accountSid),
      hasAuthToken: Boolean(env.twilio.authToken)
    });
    const fakeSid = `MOCK_${Date.now()}`;
    // eslint-disable-next-line no-console
    console.log('[WHATSAPP:MOCK]', { to, from: env.twilio.whatsappFrom, body, sid: fakeSid });
    return { sid: fakeSid, status: 'mocked' };
  }

  const client = getTwilioClient();
  const msg = await client.messages.create({
    from: env.twilio.whatsappFrom,
    to,
    body
  });

  return { sid: msg.sid, status: msg.status };
}

function buildOrderStatusMessage({ customerName, orderId, status, storeName }) {
  return `Hello ${customerName}, your order #${orderId} is now ${status}. Thank you for shopping with ${storeName}.`;
}

module.exports = { sendWhatsAppMessage, buildOrderStatusMessage };

