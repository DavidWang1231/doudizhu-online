'use strict';
/* net.js — thin PeerJS (WebRTC) wrapper. The room code doubles as the host's
   peer id; the guest dials it directly, so no game server is needed. */

const NET_PREFIX = 'ddz26-room-';
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function makeRoomCode() {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

function netAvailable() { return typeof Peer !== 'undefined'; }

/* Host side: claim the room id, accept guest connections. */
function createHostPeer(code, cb) {
  const peer = new Peer(NET_PREFIX + code, { debug: 1 });
  peer.on('open', () => cb.onReady && cb.onReady());
  peer.on('error', e => {
    if (e.type === 'unavailable-id') cb.onCodeTaken && cb.onCodeTaken();
    else cb.onError && cb.onError(e.type);
  });
  peer.on('connection', conn => {
    conn.on('open', () => cb.onConnection && cb.onConnection(conn));
  });
  return peer;
}

/* Guest side: dial the host's room id. */
function createGuestPeer(code, cb) {
  const peer = new Peer({ debug: 1 });
  peer.on('open', () => {
    const conn = peer.connect(NET_PREFIX + code, { reliable: true });
    conn.on('open', () => cb.onOpen && cb.onOpen(conn));
    conn.on('data', d => cb.onData && cb.onData(d));
    conn.on('close', () => cb.onClose && cb.onClose());
    conn.on('error', () => cb.onError && cb.onError('conn'));
  });
  peer.on('error', e => {
    if (e.type === 'peer-unavailable') cb.onNotFound && cb.onNotFound();
    else cb.onError && cb.onError(e.type);
  });
  return peer;
}
