document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const status = document.getElementById('status');
    
    let isActive = false;
    
    // 检查当前标签页状态
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tabId = tabs[0].id;
        
        // 检查插件是否已激活
        chrome.tabs.sendMessage(tabId, {action: 'checkStatus'}, function(response) {
            if (chrome.runtime.lastError) {
                // 插件未注入，显示未激活状态
                updateUI(false);
            } else if (response && response.isActive) {
                updateUI(true);
            } else {
                updateUI(false);
            }
        });
    });
    
    // 切换按钮点击事件
    toggleButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const tabId = tabs[0].id;
            
            if (!isActive) {
                // 激活工具 - 注入脚本
                                        chrome.scripting.executeScript({
                            target: {tabId: tabId},
                            files: ['html-exporter-combined.js']
                        }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('注入脚本失败:', chrome.runtime.lastError);
                        status.textContent = '激活失败，请刷新页面重试';
                        return;
                    }
                    
                    // 通知激活成功
                    chrome.tabs.sendMessage(tabId, {action: 'activate'}, function(response) {
                        if (response && response.success) {
                            updateUI(true);
                        }
                    });
                });
            } else {
                // 停用工具
                chrome.tabs.sendMessage(tabId, {action: 'deactivate'}, function(response) {
                    if (response && response.success) {
                        updateUI(false);
                    }
                });
            }
        });
    });
    
    // 更新UI状态
    function updateUI(active) {
        isActive = active;
        
        if (active) {
            toggleButton.textContent = '关闭导出功能';
            toggleButton.className = 'action-button active';
            status.textContent = '工具已激活，返回页面开始使用';
        } else {
            toggleButton.textContent = '开启导出功能';
            toggleButton.className = 'action-button';
            status.textContent = '点击上方按钮激活工具';
        }
    }
    
    // 监听来自content script的状态更新
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'statusUpdate') {
            updateUI(request.isActive);
        }
    });
});
