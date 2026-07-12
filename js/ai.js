'use strict';
/* ai.js — heuristic AI: bidding, doubling and play decisions.
   Casual-strength filler opponent/partner; runs on the host only. */

if (typeof require !== 'undefined' && typeof window === 'undefined') {
  Object.assign(globalThis, require('./cards.js'), require('./moves.js'));
}

function handStrength(handRanks, laizi) {
  const m = counts(handRanks);
  let s = 0;
  if (m[17]) s += 3;
  if (m[16]) s += 2;
  if (m[16] && m[17]) s += 2;
  s += (m[15] || 0) * 1.5;
  s += (m[14] || 0) * 0.5;
  for (let r = 3; r <= 15; r++) if (r !== laizi && m[r] === 4) s += 3;
  if (laizi) s += (m[laizi] || 0) * 1.5;
  return s;
}

function aiBid(handRanks, currentBid, laizi) {
  const s = handStrength(handRanks, laizi);
  const want = s >= 9 ? 3 : s >= 6.5 ? 2 : s >= 4.5 ? 1 : 0;
  return want > currentBid ? want : 0;
}

function aiDouble(handRanks, isLandlord, laizi) {
  return handStrength(handRanks, laizi) >= (isLandlord ? 9 : 6.5);
}

function usesBrokenBomb(mv, handCounts) {
  const w = counts(mv.play);
  for (const rs of Object.keys(w)) {
    const r = +rs;
    if (handCounts[r] === 4 && w[r] < 4) return true;
  }
  return false;
}

/* Decide a play. ctx = {hand, laizi, prev, prevSeat, mySeat, landlordSeat,
   cardCounts, nPlayers}. Returns a move {play, wild, combo} or null (pass). */
function aiPlay(ctx) {
  const { hand, laizi, prev, prevSeat, mySeat, landlordSeat, cardCounts, nPlayers } = ctx;
  const hc = counts(hand);
  const moves = legalMoves(hand, laizi, prev);
  const finish = moves.find(m => m.play.length === hand.length);
  if (finish) return finish;
  const isBomb = m => m.combo.type === 'bomb' || m.combo.type === 'rocket';

  if (!prev) {
    let best = null, bestScore = Infinity;
    for (const m of moves) {
      let s = m.combo.rank * 3 - m.play.length * 4 + m.wild * 40;
      if (isBomb(m)) s += hand.length <= 6 ? -40 : 1000;
      else if (usesBrokenBomb(m, hc)) s += 500;
      if (m.combo.type === 'single' && (hc[m.combo.rank] || 0) >= 2) s += 6;
      if (m.combo.rank >= 15) s += 12;
      if (s < bestScore) { bestScore = s; best = m; }
    }
    return best;
  }

  const iAmFarmer = mySeat !== landlordSeat;
  const partnerLed = nPlayers === 3 && iAmFarmer && prevSeat !== landlordSeat && prevSeat !== mySeat;
  const normal = moves.filter(m => !isBomb(m));

  if (partnerLed) {
    if (prev.rank >= 12 || cardCounts[prevSeat] <= 3) return null;
    const mild = normal
      .filter(m => m.wild === 0 && m.combo.rank <= 11 && !usesBrokenBomb(m, hc))
      .sort((a, b) => a.combo.rank - b.combo.rank);
    return mild[0] || null;
  }

  if (normal.length) {
    normal.sort((a, b) =>
      (a.wild - b.wild) ||
      (usesBrokenBomb(a, hc) - usesBrokenBomb(b, hc)) ||
      (a.combo.rank - b.combo.rank));
    return normal[0];
  }

  const enemies = [];
  for (let s = 0; s < nPlayers; s++) {
    if (s === mySeat) continue;
    if (iAmFarmer ? s === landlordSeat : true) enemies.push(s);
  }
  const enemyMin = Math.min(...enemies.map(s => cardCounts[s]));
  if (enemyMin <= 5 || hand.length <= 6) {
    const bombs = moves.filter(isBomb).sort((a, b) => (a.combo.power || 0) - (b.combo.power || 0));
    return bombs[0] || null;
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handStrength, aiBid, aiDouble, aiPlay };
}
