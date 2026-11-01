/* Local-only manual estimate. Uses the existing REG + combined-hit composite. */
(function (g) {
'use strict';
if (g.__SLOPRO_SAP_MANUAL__) return;
const specs = [{"model":"マイジャグラーV","settings":[{"setting":1,"BIG_denominator":273.1,"REG_denominator":409.6,"rtp_percent":97},{"setting":2,"BIG_denominator":270.8,"REG_denominator":385.5,"rtp_percent":98},{"setting":3,"BIG_denominator":266.4,"REG_denominator":336.1,"rtp_percent":99.9},{"setting":4,"BIG_denominator":254,"REG_denominator":290,"rtp_percent":102.8},{"setting":5,"BIG_denominator":240.1,"REG_denominator":268.6,"rtp_percent":105.3},{"setting":6,"BIG_denominator":229.1,"REG_denominator":229.1,"rtp_percent":109.4}]},{"model":"マイジャグラーVI","settings":[{"setting":1,"BIG_denominator":273.1,"REG_denominator":409.6,"rtp_percent":97},{"setting":2,"BIG_denominator":270.8,"REG_denominator":385.5,"rtp_percent":98},{"setting":3,"BIG_denominator":266.4,"REG_denominator":336.1,"rtp_percent":99.9},{"setting":4,"BIG_denominator":254,"REG_denominator":290,"rtp_percent":102.8},{"setting":5,"BIG_denominator":240.1,"REG_denominator":268.6,"rtp_percent":105.3},{"setting":6,"BIG_denominator":229.1,"REG_denominator":229.1,"rtp_percent":109.4}]},{"model":"ゴーゴージャグラー3","settings":[{"setting":1,"BIG_denominator":259,"REG_denominator":354.2,"rtp_percent":97.2},{"setting":2,"BIG_denominator":258,"REG_denominator":332.7,"rtp_percent":98.2},{"setting":3,"BIG_denominator":257,"REG_denominator":306.2,"rtp_percent":99.4},{"setting":4,"BIG_denominator":254,"REG_denominator":268.6,"rtp_percent":101.6},{"setting":5,"BIG_denominator":247.3,"REG_denominator":247.3,"rtp_percent":103.8},{"setting":6,"BIG_denominator":234.9,"REG_denominator":234.9,"rtp_percent":106.5}]},{"model":"SアイムジャグラーEX","settings":[{"setting":1,"BIG_denominator":273.1,"REG_denominator":439.8,"rtp_percent":97},{"setting":2,"BIG_denominator":269.7,"REG_denominator":399.6,"rtp_percent":98},{"setting":3,"BIG_denominator":269.7,"REG_denominator":331,"rtp_percent":99.5},{"setting":4,"BIG_denominator":259,"REG_denominator":315.1,"rtp_percent":101.1},{"setting":5,"BIG_denominator":259,"REG_denominator":255,"rtp_percent":103.3},{"setting":6,"BIG_denominator":255,"REG_denominator":255,"rtp_percent":105.5}]},{"model":"ファンキージャグラー2KT","settings":[{"setting":1,"BIG_denominator":266.4,"REG_denominator":439.8,"rtp_percent":97},{"setting":2,"BIG_denominator":259,"REG_denominator":407.1,"rtp_percent":98.5},{"setting":3,"BIG_denominator":256,"REG_denominator":366.1,"rtp_percent":99.8},{"setting":4,"BIG_denominator":249.2,"REG_denominator":322.8,"rtp_percent":102},{"setting":5,"BIG_denominator":240.1,"REG_denominator":299.3,"rtp_percent":104.3},{"setting":6,"BIG_denominator":219.9,"REG_denominator":262.1,"rtp_percent":109}]},{"model":"ミスタージャグラー","settings":[{"setting":1,"BIG_denominator":268.6,"REG_denominator":374.5,"rtp_percent":97},{"setting":2,"BIG_denominator":267.5,"REG_denominator":354.2,"rtp_percent":98},{"setting":3,"BIG_denominator":260.1,"REG_denominator":331,"rtp_percent":99.8},{"setting":4,"BIG_denominator":249.2,"REG_denominator":291.3,"rtp_percent":102.7},{"setting":5,"BIG_denominator":240.9,"REG_denominator":257,"rtp_percent":105.5},{"setting":6,"BIG_denominator":237.4,"REG_denominator":237.4,"rtp_percent":107.3}]},{"model":"ジャグラーガールズSS","settings":[{"setting":1,"BIG_denominator":273.1,"REG_denominator":381,"rtp_percent":97},{"setting":2,"BIG_denominator":270.8,"REG_denominator":350.5,"rtp_percent":97.9},{"setting":3,"BIG_denominator":260.1,"REG_denominator":316.6,"rtp_percent":99.9},{"setting":4,"BIG_denominator":250.1,"REG_denominator":281.3,"rtp_percent":102.1},{"setting":5,"BIG_denominator":243.6,"REG_denominator":270.8,"rtp_percent":104},{"setting":6,"BIG_denominator":226,"REG_denominator":252.1,"rtp_percent":107.5}]}];
for (const model of specs) {
  for (const row of model.settings) Object.freeze(row);
  Object.freeze(model.settings); Object.freeze(model);
}
Object.freeze(specs);
const normal = value => String(value ?? '').normalize('NFKC').trim().replace(/,/g, '');
function invalid(message, field) { const e = new Error(message); e.field = field; throw e; }
function integer(value, name, field, maximum) {
  const text = normal(value);
  if (!/^[0-9]+$/.test(text)) invalid(name + 'は0以上の整数で入力してください。', field);
  const n = Number(text);
  if (!Number.isSafeInteger(n) || n > maximum) invalid(name + 'の入力値が大きすぎます。', field);
  return n;
}
function denominator(value) {
  let text = normal(value).replace(/\s/g, '');
  if (/^1\/[0-9]+(?:\.[0-9]+)?$/.test(text)) text = text.slice(2);
  else if (/^[0-9]+(?:\.[0-9]+)?\/1$/.test(text)) text = text.slice(0, -2);
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(text)) invalid('合算が1/150.3なら「150.3」と入力してください。', 'combined');
  const n = Number(text);
  if (!Number.isFinite(n) || n < 1 || n > 1000000) invalid('合算の分母は1以上で入力してください。', 'combined');
  return n;
}
function fit(games, big, reg, modelName) {
  const spec = specs.find(x => x.model === modelName);
  if (!spec) invalid('機種を選択してください。', 'model');
  if (![games, big, reg].every(n => Number.isSafeInteger(n) && n >= 0) || big + reg > games) invalid('回転数とBB・RBの回数を確認してください。', 'games');
  if (games === 0) return {rtp_percent: null, range: null, boundary: false};
  const counts = [reg, games - reg, big + reg, games - big - reg];
  const probability = s => { const pb = 1 / s.BIG_denominator, pr = 1 / s.REG_denominator; return [pr, 1 - pr, pb + pr, 1 - pb - pr]; };
  const ll = p => p.reduce((sum, v, i) => sum + counts[i] * Math.log(v), 0);
  const candidates = [];
  for (let i = 0; i < spec.settings.length - 1; i++) {
    const a = spec.settings[i], b = spec.settings[i + 1], pa = probability(a), pb = probability(b), delta = pb.map((v, j) => v - pa[j]);
    const derivative = t => counts.reduce((sum, count, j) => sum + count * delta[j] / (pa[j] + t * delta[j]), 0);
    let t;
    if (derivative(0) <= 0) t = 0;
    else if (derivative(1) >= 0) t = 1;
    else {
      let lo = 0, hi = 1;
      for (let k = 0; k < 70; k++) { const mid = (lo + hi) / 2; if (derivative(mid) > 0) lo = mid; else hi = mid; }
      t = (lo + hi) / 2;
    }
    candidates.push({ll: ll(pa.map((v, j) => v + t * delta[j])), rtp: a.rtp_percent + t * (b.rtp_percent - a.rtp_percent)});
    if (counts.every((count, j) => count === 0 || delta[j] === 0)) candidates.push({ll: ll(pb), rtp: b.rtp_percent});
  }
  let best = candidates[0];
  for (const c of candidates) if (c.ll > best.ll) best = c;
  const tied = candidates.filter(c => Math.abs(c.ll - best.ll) <= 1e-10).map(c => c.rtp);
  const range = [Math.min(...tied), Math.max(...tied)];
  return {rtp_percent: Math.abs(range[1] - range[0]) <= 1e-9 ? best.rtp : null, range,
    boundary: Math.abs(range[0] - spec.settings[0].rtp_percent) <= 1e-9 || Math.abs(range[1] - spec.settings[spec.settings.length - 1].rtp_percent) <= 1e-9};
}
function classify(games, rtp) {
  const rateBand = rtp === null ? '判定保留' : rtp >= 104 ? '104%以上' : rtp >= 103 ? '103〜104%未満' : '103%未満';
  const sampleBand = games >= 3000 ? '3,000G以上' : games >= 2001 ? '2,001〜2,999G' : '2,000G以下';
  const tier = rtp === null ? 'range' : games < 2001 ? 'small' : games >= 3000 && rtp >= 104 ? 'top' :
    games >= 3000 && rtp >= 103 ? 'good' : rtp >= 103 ? 'watch' : 'below';
  return {rate_band: rateBand, sample_band: sampleBand, tier,
    judgment: tier === 'top' ? '優先候補' : tier === 'good' ? '候補' : tier === 'watch' ? '参考候補' :
      tier === 'small' ? '少回転・参考値' : tier === 'range' ? '一つの値に絞れません' : '103%の基準未満'};
}
function calculate(input) {
  const big = integer(input.bb, 'BB', 'bb', 100000), reg = integer(input.rb, 'RB', 'rb', 100000), hits = big + reg;
  const exact = normal(input.games) !== '';
  let games, combined;
  if (exact) {
    games = integer(input.games, '総回転数', 'games', 1000000);
    if (games < 1) invalid('総回転数は1G以上で入力してください。', 'games');
    combined = hits ? games / hits : null;
  } else {
    combined = denominator(input.combined);
    if (!hits) invalid('BB・RBがともに0回の場合は、総回転数を入力してください。', 'bb');
    games = Math.round(hits * combined);
    if (!Number.isSafeInteger(games) || games > 1000000) invalid('合算とBB・RBの回数を確認してください。', 'combined');
  }
  const scored = fit(games, big, reg, input.model);
  return {model: input.model, BB: big, REG: reg, games, games_approximate: !exact, combined_denominator: combined,
    ...scored, ...classify(games, scored.rtp_percent), method: 'REG_AND_COMBINED_COMPOSITE',
    probability_calibrated: false, manual_input: true};
}
const fmt = n => (Math.floor((n + 1e-10) * 100) / 100).toFixed(2);
function mount(w) {
  const doc = w.document, app = doc.querySelector('#app');
  if (!app) return;
  let modal = null, opener = null;
  const authorized = () => !!doc.querySelector('#app #logout');
  function close() {
    if (!modal) return;
    const old = modal; modal = null;
    if (typeof old.close === 'function' && old.open) old.close();
    old.remove();
    if (opener?.isConnected && authorized()) opener.focus();
    opener = null;
  }
  function open(button) {
    if (!authorized()) return;
    if (modal?.isConnected) { modal.querySelector('select').focus(); return; }
    opener = button || doc.activeElement;
    modal = doc.createElement('dialog'); modal.className = 'sap-manual-dialog';
    modal.setAttribute('aria-labelledby', 'sap-manual-title');
    modal.innerHTML = '<header class="sap-manual-heading"><h2 id="sap-manual-title">ジャグラー手入力判定</h2><button type="button" data-sap-manual-close aria-label="閉じる">×</button></header>' +
      '<p class="sap-manual-intro">現地の数値から推定機械割を計算します。</p>' +
      '<form class="sap-manual-form" novalidate><label for="sap-manual-model">機種<select id="sap-manual-model" name="model"></select></label>' +
      '<div class="sap-manual-counts"><label for="sap-manual-bb">BB回数<input id="sap-manual-bb" name="bb" inputmode="numeric" autocomplete="off" placeholder="例：25"></label>' +
      '<label for="sap-manual-rb">RB回数（REG）<input id="sap-manual-rb" name="rb" inputmode="numeric" autocomplete="off" placeholder="例：25"></label></div>' +
      '<label for="sap-manual-combined">合算の分母（1/○）<input id="sap-manual-combined" name="combined" inputmode="decimal" autocomplete="off" placeholder="例：150.3" aria-describedby="sap-manual-combined-help"></label>' +
      '<p id="sap-manual-combined-help" class="sap-manual-help">1/150.3なら「150.3」と入力</p>' +
      '<details class="sap-manual-exact"><summary>総回転数が分かる場合（任意）</summary><label for="sap-manual-games">総回転数<input id="sap-manual-games" name="games" inputmode="numeric" autocomplete="off" placeholder="例：6000"></label><p class="sap-manual-help">入力した総回転数を優先して計算します。</p></details>' +
      '<button type="submit" class="sap-manual-submit">判定する</button><p class="sap-manual-error" role="alert" hidden></p>' +
      '<section class="sap-manual-result" role="status" aria-live="polite" hidden></section></form>' +
      '<p class="sap-manual-footnote">REG＋合算の観測値に合う目安です。設定や勝率の確定値ではありません。入力値は端末内だけで計算します。</p>';
    const form = modal.querySelector('form'), select = form.elements.namedItem('model');
    for (const s of specs) { const option = doc.createElement('option'); option.value = s.model; option.textContent = s.model === 'ファンキージャグラー2KT' ? 'ファンキージャグラー2' : s.model; select.append(option); }
    let submitted = false;
    function draw(focusError) {
      const result = modal?.querySelector('.sap-manual-result'), error = modal?.querySelector('.sap-manual-error');
      if (!result || !error) return;
      result.hidden = true; result.replaceChildren(); error.hidden = true; error.textContent = '';
      for (const field of form.elements) field.removeAttribute('aria-invalid');
      try {
        const value = calculate(Object.fromEntries(new w.FormData(form)));
        result.dataset.tier = value.tier;
        const rate = doc.createElement('div'); rate.className = 'sap-manual-rate';
        const label = doc.createElement('span'); label.textContent = '推定機械割（REG＋合算）';
        const number = doc.createElement('strong'); number.textContent = value.rtp_percent === null ? value.range.map(fmt).join('〜') + '%' : fmt(value.rtp_percent) + '%';
        rate.append(label, number);
        const judgment = doc.createElement('b'); judgment.className = 'sap-manual-judgment'; judgment.textContent = value.judgment;
        const badges = doc.createElement('div'); badges.className = 'sap-manual-badges';
        for (const text of [value.rate_band, value.sample_band + (value.games_approximate ? '・概算' : '')]) { const tag = doc.createElement('span'); tag.textContent = text; badges.append(tag); }
        const games = doc.createElement('p'); games.className = 'sap-manual-games'; games.textContent = (value.games_approximate ? '約' : '') + value.games.toLocaleString('ja-JP') + 'G' + (value.games_approximate ? '（合算から逆算）' : '（入力した総回転数）');
        const detail = doc.createElement('p'); detail.className = 'sap-manual-help'; detail.textContent = value.games_approximate ? '合算表示の丸めにより回転数・推定値に誤差があります。' : '総回転数とBB・RBから計算しています。';
        result.append(rate, judgment, badges, games, detail);
        if (value.boundary) { const boundary = doc.createElement('p'); boundary.className = 'sap-manual-help'; boundary.textContent = '機種の公表機械割の上限・下限に達しています。'; result.append(boundary); }
        result.hidden = false;
      } catch (e) {
        error.textContent = e.message || '入力値を確認してください。'; error.hidden = false;
        const field = form.elements.namedItem(e.field || '');
        if (field) { field.setAttribute('aria-invalid', 'true'); if (focusError) field.focus(); }
      }
    }
    form.addEventListener('submit', e => { e.preventDefault(); submitted = true; draw(true); });
    form.addEventListener('input', () => { if (submitted) draw(false); });
    form.addEventListener('change', () => { if (submitted) draw(false); });
    modal.querySelector('[data-sap-manual-close]').addEventListener('click', close);
    modal.addEventListener('cancel', e => { e.preventDefault(); close(); });
    modal.addEventListener('click', e => { if (e.target === modal) { const r = modal.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } });
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const nodes = [...modal.querySelectorAll('button,input,select,summary')].filter(n => !n.disabled && n.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    doc.body.append(modal);
    if (typeof modal.showModal === 'function') modal.showModal();
    else { modal.setAttribute('open', ''); modal.dataset.fallback = 'true'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); }
    select.focus();
  }
  function ensure() {
    if (!authorized()) { close(); return; }
    const home = app.querySelector('.home-panel');
    if (home && !home.querySelector('[data-sap-manual-open]')) {
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'store-entry sap-manual-entry';
      button.setAttribute('data-sap-manual-open', ''); button.innerHTML = '<strong>ジャグラー · 手入力判定</strong><span>機種・BB・RB・合算から計算</span>'; home.append(button);
    }
    for (const heading of app.querySelectorAll('.sap-heading')) {
      if (!heading.parentElement.querySelector('.sap-manual-toolbar')) {
        const row = doc.createElement('div'); row.className = 'sap-manual-toolbar';
        const button = doc.createElement('button'); button.type = 'button'; button.setAttribute('data-sap-manual-open', ''); button.textContent = '手入力で判定';
        row.append(button); heading.after(row);
      }
    }
  }
  doc.addEventListener('click', e => {
    const button = e.target.closest?.('button');
    if (button?.id === 'logout') close();
    if (button?.hasAttribute('data-sap-manual-open')) open(button);
  }, true);
  w.addEventListener('storage', e => { if (e.key === 'slopro-auth-session-v1' || e.key === null) close(); });
  new w.MutationObserver(ensure).observe(app, {childList: true, subtree: true});
  ensure();
  return {open, close};
}
const api = {specs, fit, calculate, classify, parseDenominator: denominator, method: 'REG_AND_COMBINED_COMPOSITE', version: '2026-11-01'};
if (g.document) Object.assign(api, mount(g) || {});
g.__SLOPRO_SAP_MANUAL__ = Object.freeze(api);
})(globalThis);
