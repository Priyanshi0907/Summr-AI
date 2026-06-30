// SummrAI Gmail Content Script
(function () {
  'use strict';

  const BUTTON_CLASS = 'summrai-gmail-btn';
  const PANEL_CLASS = 'summrai-gmail-panel';

  function injectStyles() {
    if (document.getElementById('summrai-styles')) return;
    const style = document.createElement('style');
    style.id = 'summrai-styles';
    style.textContent = `
      .summrai-gmail-btn {
        display: inline-flex; align-items: center; gap: 6px;
        background: linear-gradient(135deg, #7c6af7, #e879a8);
        color: #fff; border: none; border-radius: 8px;
        padding: 7px 14px; font-size: 13px; font-weight: 500;
        cursor: pointer; margin: 8px 0;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        transition: opacity .2s;
      }
      .summrai-gmail-btn:hover { opacity: .88; }
      .summrai-gmail-btn:disabled { opacity: .5; cursor: not-allowed; }
      .summrai-gmail-panel {
        background: #f8f7ff; border: 1px solid #d4d0fb;
        border-radius: 10px; padding: 14px 16px;
        margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .summrai-panel-header {
        font-weight: 600; font-size: 13px;
        color: #7c6af7; margin-bottom: 8px;
        display: flex; align-items: center; gap: 6px;
      }
      .summrai-summary-text {
        font-size: 13px; line-height: 1.6; color: #1a1a2e; margin-bottom: 8px;
      }
      .summrai-bullets { padding-left: 18px; margin: 6px 0; }
      .summrai-bullets li { font-size: 12px; color: #444; margin-bottom: 3px; }
      .summrai-meta { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
      .summrai-meta-chip {
        padding: 2px 8px; border-radius: 999px; font-size: 11px;
        font-weight: 500; background: rgba(124,106,247,.12); color: #7c6af7;
      }
      .summrai-close {
        float: right; background: transparent; border: none;
        color: #999; cursor: pointer; font-size: 16px; line-height: 1;
      }
    `;
    document.head.appendChild(style);
  }

  function getApiUrl() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['summrai_api_url'], data => {
        resolve(data.summrai_api_url || 'https://api.summrai.app');
      });
    });
  }

  async function summarizeEmail(text, btn) {
    btn.disabled = true;
    btn.textContent = 'Summarizing…';

    try {
      const apiUrl = await getApiUrl();
      const res = await fetch(`${apiUrl}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 8000), length: 'short', options: ['bullets', 'actions'] }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();

      // Create result panel
      const panel = document.createElement('div');
      panel.className = PANEL_CLASS;

      let html = `
        <div class="summrai-panel-header">
          ✨ SummrAI Summary
          <button class="summrai-close" onclick="this.closest('.${PANEL_CLASS}').remove()">×</button>
        </div>
        <div class="summrai-meta">
          ${data.wordCount ? `<span class="summrai-meta-chip">📝 ${data.wordCount} words</span>` : ''}
          ${data.compression ? `<span class="summrai-meta-chip">📉 ${data.compression}</span>` : ''}
          ${data.readingTime ? `<span class="summrai-meta-chip">⏱ ${data.readingTime}min</span>` : ''}
        </div>
        <div class="summrai-summary-text">${data.summary || ''}</div>
      `;
      if (data.bullets?.length) {
        html += `<ul class="summrai-bullets">${data.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
      }
      panel.innerHTML = html;

      btn.parentNode.insertBefore(panel, btn);
      btn.remove();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = '⚠ Error — retry';
      console.error('[SummrAI]', err);
    }
  }

  function addSummarizeButton(emailBody) {
    if (emailBody.dataset.summraiAttached) return;
    emailBody.dataset.summraiAttached = 'true';

    const btn = document.createElement('button');
    btn.className = BUTTON_CLASS;
    btn.innerHTML = '✨ Summarize with SummrAI';
    btn.addEventListener('click', () => {
      const text = emailBody.innerText;
      summarizeEmail(text, btn);
    });

    emailBody.parentNode.insertBefore(btn, emailBody.nextSibling);
  }

  function scanForEmails() {
    const emailBodies = document.querySelectorAll('.a3s.aiL, .ii.gt');
    emailBodies.forEach(addSummarizeButton);
  }

  // Run on load + watch for dynamic email opens
  injectStyles();
  scanForEmails();

  const observer = new MutationObserver(() => scanForEmails());
  observer.observe(document.body, { childList: true, subtree: true });
})();
