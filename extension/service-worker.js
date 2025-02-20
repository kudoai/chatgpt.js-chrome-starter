const chatgptURL = 'https://chatgpt.com'

// Init APP data
const app = {
    name: chrome.runtime.getManifest().name,
    version: chrome.runtime.getManifest().version, symbol: '🤖', cssPrefix: 'chatgpt-extension',
    author: { name: 'KudoAI', url: 'https://kudoai.com' },
    urls: {
        assetHost: 'https://cdn.jsdelivr.net/gh/KudoAI/chatgpt.js-chrome-starter',
        chatgptJS: 'https://chatgptjs.org',
        cjsAssetHost: 'https://assets.chatgptjs.org',
        contributors: 'https://docs.chatgptjs.org/#-contributors',
        gitHub: 'https://github.com/KudoAI/chatgpt.js-chrome-starter',
        relatedExtensions: 'https://aiwebextensions.com',
        support: 'https://github.com/KudoAI/chatgpt.js-chrome-starter/issues'
    }
}
chrome.storage.local.set({ app }) // save to Chrome storage

// Launch CHATGPT on install
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == 'install') // to exclude updates
        chrome.tabs.create({ url: chatgptURL })
})

// Sync SETTINGS to activated tabs
chrome.tabs.onActivated.addListener(activeInfo =>
    chrome.tabs.sendMessage(activeInfo.tabId, { action: 'syncConfigToUI' }))

// Show ABOUT modal on ChatGPT when toolbar button clicked
chrome.runtime.onMessage.addListener(async req => {
    if (req.action == 'showAbout') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const chatgptTab = new URL(activeTab.url).hostname == 'chatgpt.com' ? activeTab
            : await chrome.tabs.create({ url: chatgptURL })
        if (activeTab != chatgptTab) new Promise(resolve => // after new tab loads
            chrome.tabs.onUpdated.addListener(function loadedListener(tabId, info) {
                if (tabId == chatgptTab.id && info.status == 'complete') {
                    chrome.tabs.onUpdated.removeListener(loadedListener) ; setTimeout(resolve, 500)
        }})).then(() => chrome.tabs.sendMessage(chatgptTab.id, { action: 'showAbout' }))
    }
})
