'use strict';
/* game.js — host-authoritative game state machine.
   UI-agnostic: notifies via hooks.onUpdate / hooks.onEvent, so the same class
   drives the browser (with AI timers) and Node simulations (aiDelay: 0). */

if (typeof require !== 'undefined' && typeof window === 'undefined') {
  Object.assign(globalThis, require('./cards.js'), require('./moves.js'), require('./ai.js'));
}

class Game {
  /* cfg = { mode:'classic'|'duel', laizi, noShuffle, doubling, base,
             aiDelay, players:[{name, isAI}] } */
  constructor(cfg, hooks) {
    this.cfg = Object.assign({ mode: 'classic', laizi: false, noShuffle: false, doubling: true, base: 1, aiDelay: 900 }, cfg);
    this.hooks = hooks || {};
    this.n = this.cfg.mode === 'duel' ? 2 : 3;
    this.players = this.cfg.players.map(p => ({ name: p.name, isAI: !!p.isAI }));
    this.scores = Array(this.n).fill(0);
    this.wins = Array(this.n).fill(0);
    this.state = 'idle';
    this.roundNo = 0;
    this.seq = 0;
    this.redealStreak = 0;
    this._t = null;
  }

  emit(evName, data) {
    this.seq++;
    if (evName && this.hooks.onEvent) this.hooks.onEvent(evName, data);
    if (this.hooks.onUpdate) this.hooks.onUpdate(this);
  }

  sortHand(h) { h.sort((a, b) => b.r - a.r || a.s - b.s); }

  startRound() {
    this.roundNo++;
    const n = this.n;
    const deck = this.cfg.noShuffle ? clumpedDeck() : shuffle(makeDeck());
    const hands = Array.from({ length: n }, () => []);
    if (this.cfg.noShuffle) {
      let p = 0;
      while (hands.some(h => h.length < 17)) {
        const need = 17 - hands[p].length;
        if (need > 0) hands[p].push(...deck.splice(0, Math.min(need, 1 + Math.floor(Math.random() * 3))));
        p = (p + 1) % n;
      }
      this.bottom = deck.splice(0, 3);
      this.dead = deck;
    } else {
      for (let i = 0; i < n; i++) hands[i] = deck.slice(i * 17, (i + 1) * 17);
      this.bottom = deck.slice(n * 17, n * 17 + 3);
      this.dead = deck.slice(n * 17 + 3);
    }
    this.hands = hands;
    this.hands.forEach(h => this.sortHand(h));
    this.laizi = this.cfg.laizi ? 3 + Math.floor(Math.random() * 13) : null;
    this.state = 'bidding';
    this.bidder = (this.roundNo - 1) % n;
    this.bid = 0;
    this.bidWinner = null;
    this.bids = Array(n).fill(null);
    this.bidsLeft = n;
    this.landlord = null;
    this.doubles = Array(n).fill(null);
    this.trick = { combo: null, seat: null };
    this.lastPlays = Array(n).fill(null);
    this.bombsUsed = 0;
    this.playsCount = Array(n).fill(0);
    this.discarded = [];
    this.result = null;
    this.emit('deal');
    this.pump();
  }

  actorSeat() {
    if (this.state === 'bidding') return this.bidder;
    if (this.state === 'doubling') {
      for (let i = 1; i <= this.n; i++) {
        const s = (this.landlord + i) % this.n;
        if (this.doubles[s] === null) return s;
      }
      return null;
    }
    if (this.state === 'playing') return this.turn;
    return null;
  }

  pump() {
    if (this._t) { clearTimeout(this._t); this._t = null; }
    const s = this.actorSeat();
    if (s == null || !this.players[s].isAI) return;
    const seq = this.seq;
    const run = () => { if (this.seq === seq) this.aiStep(s); };
    if (this.cfg.aiDelay <= 0) run();
    else this._t = setTimeout(run, this.cfg.aiDelay + Math.random() * 700);
  }

  aiStep(seat) {
    try {
      const ranks = this.hands[seat].map(c => c.r);
      if (this.state === 'bidding') {
        this.actBid(seat, aiBid(ranks, this.bid, this.laizi));
      } else if (this.state === 'doubling') {
        this.actDouble(seat, aiDouble(ranks, seat === this.landlord, this.laizi));
      } else if (this.state === 'playing') {
        const prev = this.trick.combo && this.trick.seat !== seat ? this.trick.combo : null;
        const mv = aiPlay({
          hand: ranks, laizi: this.laizi, prev, prevSeat: this.trick.seat,
          mySeat: seat, landlordSeat: this.landlord,
          cardCounts: this.hands.map(h => h.length), nPlayers: this.n,
        });
        if (mv) {
          const cards = materialize(this.hands[seat], mv.play, this.laizi);
          if (cards && this.actPlay(seat, cards.map(c => c.id))) return;
        }
        if (prev) this.actPass(seat);
        else {
          let low = this.hands[seat][0];
          for (const c of this.hands[seat]) if (c.r < low.r) low = c;
          this.actPlay(seat, [low.id]);
        }
      }
    } catch (e) {
      if (this.hooks.onError) this.hooks.onError(e);
      else if (typeof console !== 'undefined') console.error(e);
      // Keep the table alive: pass, or dump the lowest card when leading.
      if (this.state === 'playing') {
        if (this.trick.combo && this.trick.seat !== seat) this.actPass(seat);
        else this.actPlay(seat, [this.hands[seat][this.hands[seat].length - 1].id]);
      }
    }
  }

  actBid(seat, v) {
    if (this.state !== 'bidding' || seat !== this.bidder) return false;
    if (v !== 0 && (v <= this.bid || v > 3)) return false;
    this.bids[seat] = v;
    if (v > this.bid) { this.bid = v; this.bidWinner = seat; }
    this.bidsLeft--;
    if (v === 3 || this.bidsLeft === 0) {
      if (this.bidWinner == null) {
        this.redealStreak++;
        if (this.redealStreak >= 4) {
          // Nobody ever bids on no-shuffle trash hands sometimes; force a game.
          this.bid = 1;
          this.bidWinner = seat;
          this.setLandlord();
        } else {
          this.emit('redeal');
          this.startRound();
          return true;
        }
      } else {
        this.setLandlord();
      }
    } else {
      this.bidder = (seat + 1) % this.n;
    }
    this.emit('bid', { seat, v });
    this.pump();
    return true;
  }

  setLandlord() {
    this.redealStreak = 0;
    this.landlord = this.bidWinner;
    this.hands[this.landlord].push(...this.bottom);
    this.sortHand(this.hands[this.landlord]);
    if (this.cfg.doubling) {
      this.state = 'doubling';
    } else {
      this.beginPlay();
    }
  }

  actDouble(seat, yes) {
    if (this.state !== 'doubling' || seat !== this.actorSeat()) return false;
    this.doubles[seat] = !!yes;
    if (this.doubles.every(d => d !== null)) this.beginPlay();
    this.emit('double', { seat, yes: !!yes });
    this.pump();
    return true;
  }

  beginPlay() {
    this.state = 'playing';
    this.turn = this.landlord;
    this.trick = { combo: null, seat: null };
    this.lastPlays = Array(this.n).fill(null);
  }

  actPlay(seat, cardIds) {
    if (this.state !== 'playing' || seat !== this.turn) return false;
    const hand = this.hands[seat];
    const ids = new Set(cardIds);
    if (ids.size !== cardIds.length) return false;
    const cards = hand.filter(c => ids.has(c.id));
    if (cards.length !== cardIds.length) return false;
    const prev = this.trick.combo && this.trick.seat !== seat ? this.trick.combo : null;
    const combo = analyze(cards.map(c => c.r), prev, this.laizi);
    if (!combo) return false;
    if (prev && !beats(combo, prev)) return false;
    if (!prev) this.lastPlays = Array(this.n).fill(null);
    this.hands[seat] = hand.filter(c => !ids.has(c.id));
    this.discarded.push(...cards);
    this.playsCount[seat]++;
    if (combo.type === 'bomb' || combo.type === 'rocket') this.bombsUsed++;
    this.lastPlays[seat] = { cards, combo };
    this.trick = { combo, seat };
    if (this.hands[seat].length === 0) { this.settle(seat); return true; }
    this.turn = (seat + 1) % this.n;
    this.emit('play', { seat, combo });
    this.pump();
    return true;
  }

  actPass(seat) {
    if (this.state !== 'playing' || seat !== this.turn) return false;
    if (!this.trick.combo || this.trick.seat === seat) return false;
    this.lastPlays[seat] = { pass: true };
    this.turn = (seat + 1) % this.n;
    if (this.turn === this.trick.seat) this.trick = { combo: null, seat: this.trick.seat };
    this.emit('pass', { seat });
    this.pump();
    return true;
  }

  settle(winnerSeat) {
    this.state = 'settle';
    const L = this.landlord;
    const landlordWon = winnerSeat === L;
    let farmerPlays = 0;
    for (let s = 0; s < this.n; s++) if (s !== L) farmerPlays += this.playsCount[s];
    const spring = landlordWon && farmerPlays === 0;
    const anti = !landlordWon && this.playsCount[L] === 1;
    const mult = Math.pow(2, this.bombsUsed) * ((spring || anti) ? 2 : 1);
    const unit = this.cfg.base * this.bid * mult;
    const deltas = Array(this.n).fill(0);
    for (let f = 0; f < this.n; f++) {
      if (f === L) continue;
      let pair = unit;
      if (this.cfg.doubling) {
        if (this.doubles[L]) pair *= 2;
        if (this.doubles[f]) pair *= 2;
      }
      if (landlordWon) { deltas[f] -= pair; deltas[L] += pair; }
      else { deltas[f] += pair; deltas[L] -= pair; }
    }
    for (let s = 0; s < this.n; s++) this.scores[s] += deltas[s];
    for (let s = 0; s < this.n; s++) {
      const won = landlordWon ? s === L : s !== L;
      if (won) this.wins[s]++;
    }
    this.result = {
      winner: winnerSeat, landlordWon, deltas, mult, spring, anti,
      bombs: this.bombsUsed, base: this.cfg.base, bid: this.bid,
      doubles: this.doubles.slice(),
      hands: this.hands.map(h => h.slice()),
    };
    this.emit('settle');
  }

  nextRound() {
    if (this.state === 'settle' || this.state === 'idle') this.startRound();
  }

  stop() { if (this._t) { clearTimeout(this._t); this._t = null; } }

  /* Per-seat view: everything this seat is allowed to see. Serializable. */
  buildView(seat) {
    const settle = this.state === 'settle';
    return {
      state: this.state,
      mode: this.cfg.mode,
      flags: {
        laizi: !!this.cfg.laizi, noShuffle: !!this.cfg.noShuffle,
        doubling: !!this.cfg.doubling, base: this.cfg.base,
      },
      n: this.n,
      mySeat: seat,
      roundNo: this.roundNo,
      laizi: this.laizi,
      currentBid: this.bid,
      landlord: this.landlord,
      actor: this.actorSeat(),
      trick: this.trick.combo ? { combo: this.trick.combo, seat: this.trick.seat } : { combo: null, seat: this.trick.seat },
      bottom: this.landlord != null ? this.bottom : null,
      liveMult: Math.pow(2, this.bombsUsed || 0) * (this.bid || 1) * this.cfg.base,
      players: this.players.map((p, i) => ({
        name: p.name,
        isAI: p.isAI,
        cardCount: this.hands ? this.hands[i].length : 0,
        landlord: i === this.landlord,
        bid: this.bids ? this.bids[i] : null,
        dbl: this.doubles ? this.doubles[i] : null,
        score: this.scores[i],
        wins: this.wins[i],
        lastPlay: this.lastPlays ? this.lastPlays[i] : null,
        hand: settle ? this.hands[i] : undefined,
      })),
      myHand: this.hands ? this.hands[seat] : [],
      result: this.result,
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Game };
}
