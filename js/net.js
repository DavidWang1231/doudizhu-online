'use strict';
/* net.js — thin PeerJS (WebRTC) wrapper. The room code doubles as the host's
   peer id; the guest dials it directly, so no game server is needed.

   ICE: PeerJS's default config only carries Google STUN, which is blocked on
   some networks (notably in China) and useless behind symmetric NAT. We add
   more STUN options plus the Open Relay TURN service (free, ports 80/443,
   TCP fallback) so restrictive networks can still relay. */

const NET_PREFIX = 'ddz26-room-';
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const ICE_CONFIG = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

const PEER_OPTS = { debug: 1, config: ICE_CONFIG };

function makeRoomCode() {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

function netAvailable() { return typeof Peer !== 'undefined'; }

/* Reconnect to the signaling broker if the connection drops; existing
   WebRTC data channels keep working during broker outages. */
function autoReconnect(peer) {
  peer.on('disconnected', () => {
    if (!peer.destroyed) { try { peer.reconnect(); } catch (e) { } }
  });
}

/* Host side: claim the room id, accept guest connections. */
function createHostPeer(code, cb) {
  const peer = new Peer(NET_PREFIX + code, PEER_OPTS);
  autoReconnect(peer);
  peer.on('open', () => cb.onReady && cb.onReady());
  peer.on('error', e => {
    if (e.type === 'unavailable-id') cb.onCodeTaken && cb.onCodeTaken();
    else if (e.type !== 'peer-unavailable') cb.onError && cb.onError(e.type);
  });
  peer.on('connection', conn => {
    conn.on('open', () => cb.onConnection && cb.onConnection(conn));
  });
  return peer;
}

/* Guest side: dial the host's room id. */
function createGuestPeer(code, cb) {
  const peer = new Peer(PEER_OPTS);
  autoReconnect(peer);
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
