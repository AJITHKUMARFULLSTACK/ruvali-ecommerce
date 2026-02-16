const { prisma } = require('../config/prisma');
const { HttpError } = require('../utils/httpError');
const { ORDER_STATUSES, canTransition } = require('../utils/status');
const { sendWhatsAppMessage, buildOrderStatusMessage } = require('./whatsapp.service');

async function createOrderForStore(store, payload) {
  // payload: { customer: { name, phone }, items: [{ productId, quantity }], shippingInfo? }
  if (!payload.items || !payload.items.length) {
    throw new HttpError(400, 'Order must contain at least one item');
  }

  return prisma.$transaction(async (tx) => {
    let customer = await tx.customer.findFirst({
      where: { storeId: store.id, phone: payload.customer.phone }
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          storeId: store.id,
          name: payload.customer.name,
          phone: payload.customer.phone
        }
      });
    }

    const productIds = payload.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, storeId: store.id }
    });
    if (products.length !== productIds.length) {
      throw new HttpError(400, 'One or more products not found for this store');
    }

    const itemsData = [];
    let totalAmount = 0;

    for (const item of payload.items) {
      const product = products.find((p) => p.id === item.productId);
      const price = product.price;
      const quantity = item.quantity || 1;
      totalAmount += Number(price) * quantity;

      itemsData.push({
        productId: product.id,
        quantity,
        price
      });
    }

    const order = await tx.order.create({
      data: {
        storeId: store.id,
        customerId: customer.id,
        totalAmount,
        shippingInfo: payload.shippingInfo || null,
        status: 'PLACED',
        items: {
          create: itemsData
        },
        logs: {
          create: {
            oldStatus: null,
            newStatus: 'PLACED'
          }
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        logs: true
      }
    });

    // Fire-and-forget WhatsApp notification
    queueOrderStatusWhatsApp(store, order, null, 'PLACED').catch((err) => {
      // eslint-disable-next-line no-console
      console.error('WhatsApp send failed (PLACED)', err);
    });

    return order;
  });
}

async function listOrdersForStore(storeId) {
  return prisma.order.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      items: { include: { product: true } },
      logs: true
    }
  });
}

async function updateOrderStatusForStore(store, orderId, newStatus) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new HttpError(400, `Invalid status: ${newStatus}`);
  }

  // eslint-disable-next-line no-console
  console.log('[ORDERS] updateOrderStatusForStore called', {
    storeId: store.id,
    orderId,
    newStatus
  });

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, storeId: store.id },
      include: { customer: true }
    });

    if (!order) throw new HttpError(404, 'Order not found');

    const oldStatus = order.status;
    if (!canTransition(oldStatus, newStatus)) {
      throw new HttpError(400, `Cannot transition from ${oldStatus} to ${newStatus}`);
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        logs: {
          create: {
            oldStatus,
            newStatus
          }
        }
      },
      include: { customer: true }
    });

    queueOrderStatusWhatsApp(store, updated, oldStatus, newStatus).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('WhatsApp send failed (STATUS UPDATE)', err);
    });

    return updated;
  });
}

async function queueOrderStatusWhatsApp(store, order, oldStatus, newStatus) {
  const customer = order.customer;
  if (!customer?.phone) return;

  const msg = buildOrderStatusMessage({
    customerName: customer.name,
    orderId: order.id,
    status: newStatus,
    storeName: store.name
  });

  const toPhoneE164 = normalizePhone(customer.phone, store);

  // eslint-disable-next-line no-console
  console.log('[WHATSAPP] queueOrderStatusWhatsApp', {
    storeId: store.id,
    storeName: store.name,
    orderId: order.id,
    oldStatus,
    newStatus,
    rawPhone: customer.phone,
    normalizedPhone: toPhoneE164
  });

  const result = await sendWhatsAppMessage({ toPhoneE164, body: msg });

  // eslint-disable-next-line no-console
  console.log('[WHATSAPP] sendWhatsAppMessage result', {
    sid: result.sid,
    status: result.status
  });

  await prisma.orderStatusLog.updateMany({
    where: { orderId: order.id, newStatus },
    data: {
      whatsappTo: toPhoneE164,
      messageText: msg,
      providerMessageId: result.sid
    }
  });
}

function normalizePhone(phone, store) {
  // Very simple normalization: ensure + prefix; real implementation should be more robust.
  const trimmed = phone.replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  // Assume Indian numbers if no country code; adjust as needed.
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  return `+${trimmed}`;
}

module.exports = {
  createOrderForStore,
  listOrdersForStore,
  updateOrderStatusForStore
};

