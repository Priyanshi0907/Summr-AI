const DEFAULT_API = 'https://api.summrai.app';

// ── Tab switching ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    const content = document.getElementById('tab-' + tab.dataset.tab);
    if (content) content.classList.remove('hidden');
    if (tab.dataset.tab === 'history') loadHistory();
    if (tab.dataset.tab === 'settings') loadSettings();
  });
});

// ── Page / Selection buttons ──────────────────────────────────
document.getElementById('btn-page').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Try to get article content first
        const article = document.querySelector('article');
        const main = document.querySelector('main');
        const body = article || main || document.body;
        return body.innerText.slice(0, 10000);
      },
    });
    const text = results[0]?.result || '';
    if (text) {
      document.getElementById('input-text').value = text;
    }
  } catch (e) {
    showError('Cannot access this page.');
  }
});

document.getElementById('btn-selection').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    });
    const text = results[0]?.result || '';
    if (text.trim()) {
      document.getElementById('input-text').value = text;
    } else {
      showError('No text selected on the page.');
    }
  } catch (e) {
    showError('Cannot access this page.');
  }
});

// ── Main summarize ────────────────────────────────────────────
document.getElementById('btn-summarize').addEventListener('click', async () => {
  const text = document.getElementById('input-text').value.trim();
  if (!text) { showError('Paste some text first.'); return; }

  const length = document.getElementById('length-sel').value;
  const bullets = document.getElementById('tog-bullets').checked;

  showLoading(true);
  hideOutput();

  try {
    const { apiUrl } = await getSettings();
    const url = (apiUrl || DEFAULT_API).replace(/\/$/, '');

    const res = await fetch(`${url}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        length,
        options: bullets ? ['bullets'] : [],
        model: 'bart',
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    showOutput(data);
    saveToHistory(text, data);
  } catch (err) {
    showError(err.message || 'Summarization failed. Check your API URL in Settings.');
  } finally {
    showLoading(false);
  }
});

// ── Output rendering ──────────────────────────────────────────
function showOutput(data) {
  const el = document.getElementById('output-area');
  el.classList.remove('hidden');

  let html = '<div class="meta-row">';
  if (data.wordCount) html += `<span class="mc mc-p">📝 ${data.wordCount} words</span>`;
  if (data.compression) html += `<span class="mc mc-a">📉 ${data.compression}</span>`;
  if (data.readingTime) html += `<span class="mc mc-g">⏱ ${data.readingTime}min</span>`;
  html += '</div>';
  html += `<p style="font-size:12.5px;line-height:1.65">${data.summary || ''}</p>`;

  if (data.bullets?.length) {
    html += `<ul>${data.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
  }

  html += `<button class="copy-btn" id="copy-result">📋 Copy to clipboard</button>`;
  el.innerHTML = html;

  document.getElementById('copy-result').addEventListener('click', () => {
    const plain = (data.summary || '') + (data.bullets?.length ? '\n\n' + data.bullets.map(b => `• ${b}`).join('\n') : '');
    navigator.clipboard.writeText(plain).then(() => {
      document.getElementById('copy-result').textContent = '✓ Copied!';
      setTimeout(() => { document.getElementById('copy-result').textContent = '📋 Copy to clipboard'; }, 2000);
    });
  });
}

function hideOutput() {
  document.getElementById('output-area').classList.add('hidden');
  document.getElementById('output-area').innerHTML = '';
}

function showError(msg) {
  const el = document.getElementById('output-area');
  el.classList.remove('hidden');
  el.innerHTML = `<p style="color:#e879a8;font-size:12px">⚠ ${msg}</p>`;
}

function showLoading(show) {
  const el = document.getElementById('loading');
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

// ── History ───────────────────────────────────────────────────
function saveToHistory(text, result) {
  chrome.storage.local.get(['summrai_history'], ({ summrai_history = [] }) => {
    const item = {
      id: Date.now(),
      title: text.slice(0, 70),
      preview: result.summary || '',
      compression: result.compression || '',
      ts: Date.now(),
    };
    const updated = [item, ...summrai_history].slice(0, 50);
    chrome.storage.local.set({ summrai_history: updated });
  });
}

function loadHistory() {
  chrome.storage.local.get(['summrai_history'], ({ summrai_history = [] }) => {
    const el = document.getElementById('history-list');
    if (!summrai_history.length) {
      el.innerHTML = '<div class="empty-state">No summaries yet.<br>Generate your first one!</div>';
      return;
    }
    el.innerHTML = summrai_history.map(h => `
      <div class="history-item" onclick="loadHistoryItem(${JSON.stringify(h.preview).replace(/"/g,'&quot;')})">
        <div class="history-title">${h.title}…</div>
        <div class="history-preview">${h.preview}</div>
        <div class="history-time">${new Date(h.ts).toLocaleString()}</div>
      </div>`).join('');
  });
}

function loadHistoryItem(preview) {
  document.getElementById('input-text').value = preview;
  document.querySelector('[data-tab="summarize"]').click();
}

// ── Settings ──────────────────────────────────────────────────
function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['summrai_api_url', 'summrai_default_length'], data => {
      resolve({ apiUrl: data.summrai_api_url || DEFAULT_API, defaultLength: data.summrai_default_length || 'medium' });
    });
  });
}

async function loadSettings() {
  const { apiUrl, defaultLength } = await getSettings();
  document.getElementById('api-url').value = apiUrl;
  document.getElementById('default-length').value = defaultLength;
}

document.getElementById('btn-save-settings').addEventListener('click', () => {
  const apiUrl = document.getElementById('api-url').value.trim();
  const defaultLength = document.getElementById('default-length').value;
  chrome.storage.sync.set({ summrai_api_url: apiUrl, summrai_default_length: defaultLength }, () => {
    document.getElementById('btn-save-settings').textContent = '✓ Saved!';
    setTimeout(() => { document.getElementById('btn-save-settings').textContent = 'Save settings'; }, 2000);
  });
});

// ── Init ──────────────────────────────────────────────────────
(async () => {
  const { defaultLength } = await getSettings();
  document.getElementById('length-sel').value = defaultLength;

  // Check if there's pending text from context menu
  const { pendingText } = await chrome.storage.session.get('pendingText').catch(() => ({}));
  if (pendingText) {
    document.getElementById('input-text').value = pendingText;
    chrome.storage.session.remove('pendingText');
  }
})();
