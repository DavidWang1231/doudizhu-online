'use strict';
/* i18n.js — zh/en UI strings. */

const I18N = {
  zh: {
    title: '斗地主 Online',
    subtitle: '和朋友在线联机 · 无需注册',
    h_name: '你的昵称',
    h_mode: '玩法',
    m_classic: '经典三人',
    m_classic_d: '1–3 人联机,空位由 AI 补',
    m_duel: '二人对决',
    m_duel_d: '1v1,17 张废牌不入局',
    m_team: '四人 2v2',
    m_team_d: '对家组队,每人 13 张',
    h_options: '房间选项',
    o_laizi: '癞子场',
    o_laizi_d: '每局随机一种牌当万能牌',
    o_noshuffle: '不洗牌',
    o_noshuffle_d: '疯狂模式,炸弹满天飞',
    o_doubling: '加倍阶段',
    o_doubling_d: '定地主后可选加倍',
    o_base: '底分',
    b_practice: '单机练习',
    b_practice_d: 'AI 陪打,先熟悉一下',
    b_create: '创建房间',
    b_create_d: '拿到房间码发给朋友',
    h_join: '加入朋友的房间',
    ph_code: '输入房间码',
    b_join: '加入',
    b_help: '玩法说明',
    tt_bgm: '背景音乐',
    tt_snd: '音效',
    r_code: '房间码',
    b_copy: '复制',
    copied: '已复制',
    r_waiting: '等待朋友加入…',
    r_players: '玩家',
    b_start: '开始游戏',
    b_leave: '离开',
    r_ai: 'AI 补位',
    r_host: '房主',
    g_landlord: '地主',
    g_ally: '地主队友',
    g_farmer: '农民',
    lord_banner: '{0} 成为地主!',
    g_bottom: '底牌',
    g_laizi: '癞子',
    g_mult: '倍数',
    g_round: '第 {0} 局',
    g_dead: '二人场:17 张牌不入局',
    bid0: '不叫',
    bidN: '{0} 分',
    dblY: '加倍',
    dblN: '不加倍',
    b_play: '出牌',
    b_pass: '不出',
    b_hint: '提示',
    lead_any: '轮到你了,任意出牌',
    your_turn: '轮到你了',
    thinking: '{0} 思考中…',
    pass_txt: '不出',
    c_single: '单张', c_pair: '对子', c_trio: '三条', c_trio_single: '三带一',
    c_trio_pair: '三带二', c_straight: '顺子', c_pair_straight: '连对',
    c_plane: '飞机', c_plane_single: '飞机带单', c_plane_pair: '飞机带对',
    c_four_two: '四带二', c_four_two_pairs: '四带两对',
    c_bomb: '炸弹', c_soft: '软炸', c_laizi_bomb: '癞子炸', c_rocket: '王炸',
    s_lwin: '地主胜利!',
    s_fwin: '农民胜利!',
    s_youwin: '你赢了 🎉',
    s_youlose: '你输了 😵',
    s_spring: '春天 ×2',
    s_anti: '反春 ×2',
    s_bombs: '炸弹 ×{0}',
    s_base: '底分 {0}',
    s_bid: '叫分 {0}',
    s_total: '总倍数 ×{0}',
    b_again: '再来一局',
    b_home: '返回大厅',
    e_invalid: '不符合规则,换个出法',
    e_room404: '房间不存在,检查一下房间码',
    e_conn: '连接失败,请重试',
    e_net: '联机服务初始化失败(单机练习不受影响)',
    e_full: '房间已满或游戏已开始',
    e_disconnected: '{0} 掉线,已由 AI 接管',
    e_hostleft: '房主已离开,房间关闭',
    e_redeal: '无人叫地主,重新发牌',
    jk_small: '小王', jk_big: '大王',
    ai_tag: 'AI',
    cards_left: '剩 {0} 张',
    score_pts: '{0} 分',
    chat: ['快点啦～', '大的来了!', '炸得漂亮!', '这牌没法打', '再来一局,决战到天亮', '哈哈哈哈', '佩服佩服', '你是 AI 吗?'],
    help_title: '玩法说明',
    help_body: `
<h3>基本规则</h3>
<p>经典三人:每人 17 张,叫分(1/2/3)最高者当地主并拿 3 张底牌。地主先出,先出完手牌的一方获胜。牌型:单张、对子、三条、三带一/二、顺子(≥5 张)、连对(≥3 对)、飞机(带翅膀)、四带二、炸弹、王炸。</p>
<h3>二人对决</h3>
<p>每人 17 张,地主拿 3 张底牌,剩余 17 张不入局。规则同三人。</p>
<h3>癞子场</h3>
<p>每局随机指定一种牌为癞子(万能牌),可替代 3~2 的任意牌。单出的癞子只算本牌;含癞子的炸弹是"软炸",小于同点数的普通炸弹;4 张癞子一起打出为"癞子炸",大过一切炸弹(仅次于王炸)。含癞子的出牌自动按最强的解释来算。</p>
<h3>不洗牌</h3>
<p>发牌前基本不洗牌,同点数扎堆,炸弹与飞机极多,倍数飞涨。</p>
<h3>计分</h3>
<p>得分 = 底分 × 叫分 × 2^炸弹数 × 春天(×2) × 加倍。春天:地主打完时农民一张未出;反春:地主只出过第一手。</p>
<h3>联机</h3>
<p>创建房间后把 4 位房间码发给朋友(经典模式最多 2 位、二人对决 1 位),对方在首页输入即可加入,点对点直连。人数不足时空位由 AI 补齐;中途掉线也会由 AI 接管。</p>`,
  },
  en: {
    title: 'Dou Dizhu Online',
    subtitle: 'Play with friends online · no signup',
    h_name: 'Your nickname',
    h_mode: 'Game mode',
    m_classic: 'Classic (3P)',
    m_classic_d: 'For 1–3 humans — AIs fill any empty seat',
    m_duel: 'Heads-up duel',
    m_duel_d: '1v1, 17 cards set aside',
    m_team: '4P teams (2v2)',
    m_team_d: 'Partners sit opposite, 13 cards each',
    h_options: 'Room options',
    o_laizi: 'Wildcard (Laizi)',
    o_laizi_d: 'One random rank is wild each round',
    o_noshuffle: 'No-shuffle',
    o_noshuffle_d: 'Crazy mode — bombs everywhere',
    o_doubling: 'Doubling phase',
    o_doubling_d: 'Optional ×2 after the landlord is set',
    o_base: 'Base stake',
    b_practice: 'Practice vs AI',
    b_practice_d: 'Warm up against bots',
    b_create: 'Create room',
    b_create_d: 'Get a code, send it to a friend',
    h_join: "Join a friend's room",
    ph_code: 'Enter room code',
    b_join: 'Join',
    b_help: 'How to play',
    tt_bgm: 'Background music',
    tt_snd: 'Sound effects',
    r_code: 'Room code',
    b_copy: 'Copy',
    copied: 'Copied',
    r_waiting: 'Waiting for your friend…',
    r_players: 'Players',
    b_start: 'Start game',
    b_leave: 'Leave',
    r_ai: 'AI seat',
    r_host: 'Host',
    g_landlord: 'Landlord',
    g_ally: 'Landlord ally',
    g_farmer: 'Farmer',
    lord_banner: '{0} is the landlord!',
    g_bottom: 'Kitty',
    g_laizi: 'Wild',
    g_mult: 'Multiplier',
    g_round: 'Round {0}',
    g_dead: 'Duel: 17 cards out of play',
    bid0: 'Pass',
    bidN: 'Bid {0}',
    dblY: 'Double',
    dblN: 'No double',
    b_play: 'Play',
    b_pass: 'Pass',
    b_hint: 'Hint',
    lead_any: 'Your lead — play anything',
    your_turn: 'Your turn',
    thinking: '{0} is thinking…',
    pass_txt: 'Pass',
    c_single: 'Single', c_pair: 'Pair', c_trio: 'Trio', c_trio_single: 'Trio + 1',
    c_trio_pair: 'Trio + pair', c_straight: 'Straight', c_pair_straight: 'Pair straight',
    c_plane: 'Plane', c_plane_single: 'Plane + singles', c_plane_pair: 'Plane + pairs',
    c_four_two: 'Four + 2', c_four_two_pairs: 'Four + 2 pairs',
    c_bomb: 'Bomb', c_soft: 'Soft bomb', c_laizi_bomb: 'Wild bomb', c_rocket: 'Rocket',
    s_lwin: 'Landlord wins!',
    s_fwin: 'Farmers win!',
    s_youwin: 'You win 🎉',
    s_youlose: 'You lose 😵',
    s_spring: 'Spring ×2',
    s_anti: 'Anti-spring ×2',
    s_bombs: 'Bombs ×{0}',
    s_base: 'Base {0}',
    s_bid: 'Bid {0}',
    s_total: 'Total ×{0}',
    b_again: 'Play again',
    b_home: 'Back to lobby',
    e_invalid: "That doesn't work — try another play",
    e_room404: 'Room not found — check the code',
    e_conn: 'Connection failed, please retry',
    e_net: 'Online service unavailable (practice mode still works)',
    e_full: 'Room is full or the game already started',
    e_disconnected: '{0} disconnected — an AI took over',
    e_hostleft: 'The host left; room closed',
    e_redeal: 'Nobody bid — redealing',
    jk_small: 'joker', jk_big: 'JOKER',
    ai_tag: 'AI',
    cards_left: '{0} left',
    score_pts: '{0} pts',
    chat: ['Hurry up~', 'Big one coming!', 'Nice bomb!', 'My hand is hopeless', 'One more, all night long!', 'Hahaha', 'Respect!', 'Are you a bot?'],
    help_title: 'How to play',
    help_body: `
<h3>Basics</h3>
<p>Classic 3P: 17 cards each; the highest bidder (1/2/3) becomes the landlord and takes the 3-card kitty. The landlord leads; first to empty their hand wins. Combos: single, pair, trio, trio+1/+2, straight (5+), pair straight (3+ pairs), plane (with wings), four+2, bomb, rocket.</p>
<h3>Heads-up duel</h3>
<p>17 cards each, the landlord takes the kitty, the remaining 17 cards stay out of play. Same combos as 3P.</p>
<h3>Wildcard (Laizi)</h3>
<p>Each round one random rank is wild and can stand in for any rank 3–2. A wild played alone counts as its own rank. A bomb containing wilds is a "soft bomb" and loses to the natural bomb of the same rank; four wilds together form the top bomb (only the rocket beats it). Wild plays are read as their strongest interpretation.</p>
<h3>No-shuffle</h3>
<p>The deck is barely shuffled, so equal ranks clump — bombs and planes everywhere, multipliers explode.</p>
<h3>Scoring</h3>
<p>Score = base × bid × 2^bombs × spring (×2) × doubles. Spring: farmers never played; anti-spring: the landlord only played the first hand.</p>
<h3>Online play</h3>
<p>Create a room and send the 4-character code to your friends (up to 2 in Classic, 1 in Duel); they enter it on the home screen and connect peer-to-peer. AIs fill any empty seats and take over if someone disconnects.</p>`,
  },
};

let LANG = 'zh';
function t(k, ...a) {
  let s = I18N[LANG][k];
  if (s === undefined) s = I18N.zh[k];
  if (s === undefined) return k;
  if (typeof s === 'string') s = s.replace(/\{(\d)\}/g, (_, i) => a[+i]);
  return s;
}
function setLang(l) {
  LANG = I18N[l] ? l : 'zh';
  try { localStorage.setItem('ddz_lang', LANG); } catch (e) { }
}
