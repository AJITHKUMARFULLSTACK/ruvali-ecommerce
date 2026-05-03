/**
 * WhatsApp admin SSE: supports `event:` / `data:` frames and legacy `data: {...}` lines.
 */

function dispatchPayload(eventName, obj, callbacks) {
  if (eventName === 'qr' && obj.qr) {
    callbacks.onQr?.(obj.qr);
  }
  if (obj.qr && (eventName === 'qr' || obj.type === 'qr')) {
    callbacks.onQr?.(obj.qr);
  }

  const status =
    obj.status ||
    (obj.type === 'ready' ? 'connected' : null) ||
    (obj.type === 'qr_expired' ? 'qr_expired' : null);

  if (status || eventName === 'status') {
    callbacks.onStatus?.(status || obj.status || '', obj);
  }

  if (obj.type === 'ready') {
    callbacks.onStatus?.('connected', obj);
  }
  if (obj.type === 'qr_expired' || obj.status === 'qr_expired') {
    callbacks.onStatus?.('qr_expired', obj);
  }
  const errMsg = obj.message || obj.error;
  if (obj.status === 'error' && errMsg) {
    callbacks.onError?.(errMsg);
  }
}

export async function consumeWhatsAppSse(reader, signal, callbacks) {
  const decoder = new TextDecoder();
  let buf = '';

  const consumeBlock = (block) => {
    const lines = block.split('\n').filter((l) => l.length && !l.startsWith(':'));
    let pendingEvent = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        pendingEvent = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const jsonStr = line.slice(5).trim();
        try {
          const obj = JSON.parse(jsonStr);
          dispatchPayload(pendingEvent, obj, callbacks);
        } catch {
          /* heartbeat / malformed */
        }
        pendingEvent = '';
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (signal?.aborted) break;

    if (done) {
      if (!signal?.aborted) {
        callbacks.onStreamEnd?.();
      }
      break;
    }

    buf += decoder.decode(value, { stream: true });

    /** Allow cooperative cancel */
    if (signal?.aborted) break;

    let sep;
    while ((sep = buf.indexOf('\n\n')) !== -1) {
      const chunk = buf.slice(0, sep);
      buf = buf.slice(sep + 2);
      consumeBlock(chunk);
    }

    /** Single-line streaming legacy `data: {...}` without blank line yet */
    const lines = buf.split('\n');
    if (lines.length > 1) {
      for (let i = 0; i < lines.length - 1; i += 1) {
        const ln = lines[i];
        if (ln.startsWith('data: ') && ln.length > 6) {
          try {
            const obj = JSON.parse(ln.slice(6).trim());
            dispatchPayload('', obj, callbacks);
          } catch {
            /* partial */
          }
        }
      }
      buf = lines[lines.length - 1];
    }
  }
}

export async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function backoffBeforeRetry(attempt0) {
  const steps = [800, 2600, 7200];
  await delay(steps[Math.min(attempt0, steps.length - 1)] || 9000);
}
