// Background Script - 处理插件的后台逻辑

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('HTML导出PNG工具插件已安装');
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'statusUpdate') {
        // 来自content script的状态更新
        if (sender.tab) {
            if (request.isActive) {
                chrome.action.setBadgeText({
                    text: '●',
                    tabId: sender.tab.id
                });
                chrome.action.setBadgeBackgroundColor({
                    color: '#28a745',
                    tabId: sender.tab.id
                });
            } else {
                chrome.action.setBadgeText({
                    text: '',
                    tabId: sender.tab.id
                });
            }
        }
    }
});

// 标签页更新时清除badge（因为页面刷新了）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    }
});
