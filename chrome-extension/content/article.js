// SummrAI Article Content Script — adds floating summarize button
(function () {
  'use strict';

  // Skip Gmail (handled by gmail.js)
  if (window.location.hostname.includes('mail.google.com')) return;

  // Don't run on summrai.app itself
  if (window.location.hostname.includes('summrai.app')) return;

  function injectFABStyles() {
    if (document.getElementById('summrai-fab-styles')) return;
    const style = document.createElement('style');
    style.id = 'summrai-fab-styles';
    style.textContent = `
      #summrai-fab {
        position: fixed; bottom: 24px; right: 24px; z-index: 999999;
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg, #7c6af7, #e879a8);
        color: #fff; border: none; font-size: 20px; cursor: pointer;
        box-shadow: 0 4px 20px rgba(124,106,247,.45);
        transition: transform .2s, box-shadow .2s;
        display: flex; align-items: center; justify-content: center;
      }
      #summrai-fab:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 28px rgba(124,106,247,.55);
      }
      #summrai-toast {
        position: fixed; bottom: 88px; right: 24px; z-index: 999999;
        background: #1e1e2d; color: #f2f2fa; border: 1px solid rgba(124,106,247,.4);
        border-radius: 10px; padding: 10px 14px; font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        max-width: 260px; line-height: 1.5;
        box-shadow: 0 4px 20px rgba(0,0,0,.4);
        animation: summrai-slide-up .25s ease;
      }
      @keyframes summrai-slide-up {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(msg) {
    const existing = document.getElementById('summrai-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'summrai-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function getPageText() {
    const article = document.querySelector('article');
    const main = document.querySelector('main');
    const target = article || main || document.body;
    return target.innerText.slice(0, 10000);
  }

  function createFAB() {
    if (document.getElementById('summrai-fab')) return;

    injectFABStyles();

    const fab = document.createElement('button');
    fab.id = 'summrai-fab';
    fab.title = 'Summarize this page with SummrAI';
    fab.textContent = '✨';
    fab.setAttribute('aria-label', 'Summarize this page with SummrAI');

    fab.addEventListener('click', () => {
      const text = window.getSelection().toString() || getPageText();
      if (!text.trim()) { showToast('No text found on this page.'); return; }
      chrome.runtime.sendMessage({ type: 'SUMMARIZE_TEXT', text });
      chrome.action.openPopup().catch(() => {
        showToast('Click the SummrAI icon in the toolbar to summarize!');
      });
    });

    document.body.appendChild(fab);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFAB);
  } else {
    createFAB();
  }
})();
