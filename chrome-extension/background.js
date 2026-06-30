chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summrai-summarize',
    title: 'Summarize with SummrAI',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summrai-summarize' && info.selectionText) {
    chrome.storage.session.set({ pendingText: info.selectionText });
    chrome.action.openPopup();
  }
});
