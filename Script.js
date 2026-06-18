let expr = '';
let lastAns = 0;
let shiftOn = false;
let angleMode = 'DEG';

const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');
const modeEl = document.getElementById('mode');
const shiftBtn = document.getElementById('shiftBtn');

function updateDisplay() {
  exprEl.textContent = expr;
  const len = expr.length;
  resultEl.classList.remove('shrink', 'tiny');
  if (len > 16) resultEl.classList.add('tiny');
  else if (len > 10) resultEl.classList.add('shrink');
}

function insert(val) {
  if (val === 'x²') expr += '^2';
  else expr += val;
  updateDisplay();
}

function insertFn(fn) {
  expr += fn + '(';
  updateDisplay();
}

function insertAns() {
  expr += 'Ans';
  updateDisplay();
}

function insertExp() {
  expr += '×10^';
  updateDisplay();
}

function storeAns() {
  lastAns = parseFloat(resultEl.textContent) || lastAns;
}

function clearAll() {
  expr = '';
  resultEl.textContent = '0';
  updateDisplay();
}

function deleteLast() {
  const fns = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', 'ln(', 'log(', '√(', '×10^'];
  for (const fn of fns) {
    if (expr.endsWith(fn)) {
      expr = expr.slice(0, -fn.length);
      updateDisplay();
      return;
    }
  }
  expr = expr.slice(0, -1);
  updateDisplay();
}

function negate() {
  if (expr === '' || expr === '0') return;
  if (expr.startsWith('-')) expr = expr.slice(1);
  else expr = '-' + expr;
  updateDisplay();
}

function toggleShift() {
  shiftOn = !shiftOn;
  shiftBtn.classList.toggle('active', shiftOn);
}

function toggleDRG() {
  const modes = ['DEG', 'RAD', 'GRAD'];
  const i = modes.indexOf(angleMode);
  angleMode = modes[(i + 1) % 3];
  modeEl.textContent = angleMode;
}

function toRad(val) {
  if (angleMode === 'DEG') return val * Math.PI / 180;
  if (angleMode === 'GRAD') return val * Math.PI / 200;
  return val;
}

function fromRad(val) {
  if (angleMode === 'DEG') return val * 180 / Math.PI;
  if (angleMode === 'GRAD') return val * 200 / Math.PI;
  return val;
}

function factorial(n) {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function calculate() {
  if (!expr.trim()) return;
  try {
    let e = expr;

    e = e.replace(/Ans/g, '(' + lastAns + ')');
    e = e.replace(/π/g, '(Math.PI)');
    e = e.replace(/e(?!\^)/g, '(Math.E)');
    e = e.replace(/÷/g, '/');
    e = e.replace(/×/g, '*');
    e = e.replace(/\^/g, '**');

    e = e.replace(/sin⁻¹\(/g, '__asin__(');
    e = e.replace(/cos⁻¹\(/g, '__acos__(');
    e = e.replace(/tan⁻¹\(/g, '__atan__(');
    e = e.replace(/sin\(/g, '__sin__(');
    e = e.replace(/cos\(/g, '__cos__(');
    e = e.replace(/tan\(/g, '__tan__(');
    e = e.replace(/ln\(/g, '__ln__(');
    e = e.replace(/log\(/g, '__log__(');
    e = e.replace(/√\(/g, '__sqrt__(');

    e = e.replace(/(\d+(?:\.\d+)?)\s*mod\s*(\d+(?:\.\d+)?)/g, '($1 % $2)');
    e = e.replace(/(\d+(?:\.\d+)?)!/g, (_, n) => factorial(parseFloat(n)));

    e = e.replace(/__sin__\(([^)]+)\)/g, (_, a) => Math.sin(toRad(eval(a))));
    e = e.replace(/__cos__\(([^)]+)\)/g, (_, a) => Math.cos(toRad(eval(a))));
    e = e.replace(/__tan__\(([^)]+)\)/g, (_, a) => Math.tan(toRad(eval(a))));
    e = e.replace(/__asin__\(([^)]+)\)/g, (_, a) => fromRad(Math.asin(eval(a))));
    e = e.replace(/__acos__\(([^)]+)\)/g, (_, a) => fromRad(Math.acos(eval(a))));
    e = e.replace(/__atan__\(([^)]+)\)/g, (_, a) => fromRad(Math.atan(eval(a))));
    e = e.replace(/__ln__\(([^)]+)\)/g, (_, a) => Math.log(eval(a)));
    e = e.replace(/__log__\(([^)]+)\)/g, (_, a) => Math.log10(eval(a)));
    e = e.replace(/__sqrt__\(([^)]+)\)/g, (_, a) => Math.sqrt(eval(a)));

    let result = eval(e);

    if (typeof result === 'number') {
      if (!isFinite(result)) {
        resultEl.textContent = result > 0 ? '∞' : result < 0 ? '-∞' : 'Error';
      } else if (Math.abs(result) > 1e12 || (Math.abs(result) < 1e-7 && result !== 0)) {
        resultEl.textContent = result.toExponential(6);
      } else {
        resultEl.textContent = parseFloat(result.toFixed(10)).toString();
      }
      lastAns = result;
    } else {
      resultEl.textContent = 'Error';
    }

    exprEl.textContent = expr + ' =';
    expr = resultEl.textContent === 'Error' ? '' : resultEl.textContent;

  } catch {
    resultEl.textContent = 'Error';
    exprEl.textContent = expr;
  }

  const len = resultEl.textContent.length;
  resultEl.classList.remove('shrink', 'tiny');
  if (len > 14) resultEl.classList.add('tiny');
  else if (len > 9) resultEl.classList.add('shrink');
}

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('pointerdown', function(e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 400);
  });
});

document.addEventListener('keydown', e => {
  const map = {
    '0':'0','1':'1','2':'2','3':'3','4':'4',
    '5':'5','6':'6','7':'7','8':'8','9':'9',
    '+':'+','-':'-','*':'×','/':'÷','.':'.',
    '(':' ( ',')':') ','Enter':'=','Backspace':'del','Escape':'clr','^':'^'
  };
  const k = map[e.key];
  if (!k) return;
  e.preventDefault();
  if (k === '=') calculate();
  else if (k === 'del') deleteLast();
  else if (k === 'clr') clearAll();
  else insert(k);
});
