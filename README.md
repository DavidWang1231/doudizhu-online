# Dou Dizhu Online (斗地主)

A browser-based Dou Dizhu (Fight the Landlord) game you can play online with a
friend — pure static files, peer-to-peer via WebRTC, no server and no signup.

## Features

- **Classic 3-player** — for 1–3 humans; AIs fill any empty seats (practice
  solo, invite one friend, or play a full human table)
- **Heads-up duel (二人对决)** — 1v1 variant, 17 cards set aside
- **4-player teams (2v2)** — partners sit opposite; the bid winner's partner
  joins the landlord side, 13 cards each
- **Wildcard rounds (癞子场)** — one random rank is wild each round, with soft
  bombs, natural-rank rules and the 4-wild super bomb
- **No-shuffle mode (不洗牌)** — barely-shuffled deck, bombs everywhere
- **Doubling phase, base-stake selection, spring/anti-spring scoring,
  cumulative session scores**
- Hint button (cycles through candidate plays), drag across the hand to
  multi-select, quick-chat phrases, bilingual UI (中文 / English)
- Sound effects + generative background music (WebAudio, no assets),
  landlord-reveal animation
- AI takes over instantly if a player disconnects

## How online play works

The room code doubles as a [PeerJS](https://peerjs.com) peer id. The host's
browser runs the authoritative game state; the guest connects directly over
WebRTC (PeerJS's free public broker is only used for the handshake). No game
data touches any server.

1. Host: pick a mode → **Create room** → send the 4-character code to friends
   (up to 2 guests in Classic, 3 in 2v2, 1 in Duel)
2. Guest: enter the code → **Join**
3. Host: **Start game**

## Run locally

Any static file server works:

```bash
cd doudizhu-online
python3 -m http.server 8000
# open http://localhost:8000
```

Practice mode works fully offline; online rooms need internet for the WebRTC
handshake.

## Deploy (GitHub Pages)

Push this directory to a GitHub repo, then enable
**Settings → Pages → Deploy from branch** (`main`, root). The site is fully
static — no build step.

## Tests

The rules engine (combo detection, wildcard analysis, move generation) and the
full game loop are covered by Node tests, including 720 simulated AI-vs-AI
rounds across all mode combinations:

```bash
node tests/engine.test.js
```

## Architecture

| File | Role |
| --- | --- |
| `js/cards.js` | Deck, combo detection/comparison, wildcard (laizi) analysis — pure functions |
| `js/moves.js` | Legal move generation (shared by the hint button and the AI) |
| `js/ai.js` | Heuristic AI: bidding, doubling, play decisions |
| `js/game.js` | Host-authoritative state machine (bidding → doubling → playing → settle) |
| `js/net.js` | Thin PeerJS wrapper (room code = peer id) |
| `js/ui.js` | Screens, rendering, host/guest plumbing |
| `js/i18n.js` | zh/en strings |

---

## 中文说明

纯静态网页斗地主,和朋友点对点联机(1–3 人,空位 AI 补),无需服务器、无需注册。

**模式**:经典三人(AI 补位)/ 二人对决 / 四人 2v2 / 癞子场 / 不洗牌疯狂场,支持加倍、
底分、春天/反春计分、局间累计积分,带提示和快捷聊天。

**联机方式**:创建房间后把 4 位房间码发给朋友,对方在首页输入即可直连
(WebRTC 点对点,牌局数据不经过任何服务器)。单机练习完全离线可玩。

**本地运行**:`python3 -m http.server 8000` 后打开 `http://localhost:8000`。

**测试**:`node tests/engine.test.js`(含全模式各 120 局 AI 自动对局仿真)。
