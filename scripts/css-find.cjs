#!/usr/bin/env node
/*
 * 공통 CSS 에 "이 스타일" 이 이미 있는지 찾는다. (CLAUDE.md §1-2 의 1단계)
 *
 *   node scripts/css-find.cjs "flex:1; min-height:0; overflow-y:auto"
 *   node scripts/css-find.cjs "display:flex" "align-items:center"
 *
 * 선언 순서가 달라도 같은 것으로 본다. 완전 일치와 부분 일치를 나눠 보여준다.
 * - 완전 일치가 있으면 그 클래스를 쓴다(단, 이름·의도가 맞는지 확인 — 값만 같을 수 있다).
 * - 부분 일치면 그 클래스를 쓰고 차이나는 선언만 새 클래스로 덧붙인다.
 * - 아무것도 없으면 police-common.css 에 새로 만든다(덮어야 하면 police-override.css).
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  ['police-style.css', '원본(읽기 전용)'],
  ['police-common.css', 'common'],
  ['police-override.css', 'override'],
];
const DIR = path.join(__dirname, '..', 'public', 'portal', 'asset', 'css', 'common');

function parse(file) {
  const src = fs.readFileSync(file, 'utf8').split('\r\n').join('\n');
  const lines = src.split('\n');
  const lineStart = [];
  { let o = 0; for (const l of lines) { lineStart.push(o); o += l.length + 1; } }
  const lineAt = off => {
    let lo = 0, hi = lineStart.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStart[mid] <= off) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
  // 주석과 @charset 은 위치를 보존하며 공백으로 지운다(줄번호가 밀리지 않게)
  const noCom = src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/@charset[^;]*;/g, m => ' '.repeat(m.length));
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(noCom))) {
    const rawSel = m[1];
    const sel = rawSel.trim().replace(/\s+/g, ' ');
    if (!sel || sel.startsWith('@')) continue;
    const decls = m[2].split(';').map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
    if (!decls.length) continue;
    rules.push({ sel, line: lineAt(m.index + rawSel.length - rawSel.trimStart().length), decls });
  }
  return rules;
}

const norm = d => d.replace(/\s*:\s*/, ': ').replace(/\s+/g, ' ').trim().toLowerCase();

const query = process.argv.slice(2).join(';').split(';').map(norm).filter(Boolean);
if (!query.length) {
  console.log('사용법: node scripts/css-find.cjs "flex:1; min-height:0; overflow-y:auto"');
  process.exit(1);
}
const q = new Set(query);

const exact = [], partial = [];
for (const [file, label] of FILES) {
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) continue;
  for (const r of parse(p)) {
    const d = new Set(r.decls.map(norm));
    const hit = [...q].filter(x => d.has(x));
    if (!hit.length) continue;
    const row = { label, ...r, hit: hit.length, extra: [...d].filter(x => !q.has(x)) };
    if (hit.length === q.size && d.size === q.size) exact.push(row);
    else partial.push(row);
  }
}
partial.sort((a, b) => b.hit - a.hit);

console.log('찾는 선언 ' + q.size + '개: ' + [...q].join('; ') + '\n');
if (exact.length) {
  console.log('■ 완전 일치 — 이 클래스를 쓴다(이름·의도가 맞는지 확인)');
  for (const r of exact) console.log('   ' + r.sel + '   [' + r.label + ' L' + r.line + ']');
} else {
  console.log('■ 완전 일치 없음');
}
const top = partial.filter(r => r.hit >= Math.min(2, q.size)).slice(0, 12);
if (top.length) {
  console.log('\n■ 부분 일치 — 이걸 쓰고 차이나는 선언만 새 클래스로 덧붙이는 걸 먼저 검토한다');
  for (const r of top) {
    console.log('   ' + r.sel + '   [' + r.label + ' L' + r.line + ']  ' + r.hit + '/' + q.size +
      (r.extra.length ? '  +' + r.extra.join('; ') : ''));
  }
}
if (!exact.length && !top.length) {
  console.log('\n→ 새로 만든다. 기본은 police-common.css, 컴포넌트·테일윈드를 덮어야 하면 police-override.css.');
  console.log('  이름은 .lp-{역할}, 만들었으면 component-guide.md §12 표에 등재한다.');
}
