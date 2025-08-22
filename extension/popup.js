document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const deactivateButton = document.getElementById('deactivateButton');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const sizeSelect = document.getElementById('sizeSelect');
    const backgroundRadios = document.querySelectorAll('input[name="background"]');
    const marginEnabledCheckbox = document.getElementById('marginEnabled');
    const marginSettings = document.getElementById('marginSettings');
    const marginSizeInput = document.getElementById('marginSize');
    
    let currentTabId = null;
    let toolStatus = 'inactive'; // inactive, ready, selecting, downloading
    
    // 从存储中恢复设置
    function loadSettings() {
        chrome.storage.sync.get(['backgroundColor', 'maxWidth', 'marginEnabled', 'marginSize'], function(result) {
            // 设置背景选项
            if (result.backgroundColor) {
                const targetRadio = document.querySelector(`input[name="background"][value="${result.backgroundColor}"]`);
                if (targetRadio) {
                    targetRadio.checked = true;
                }
            }
            
            // 设置尺寸选项
            if (result.maxWidth) {
                sizeSelect.value = result.maxWidth;
            }
            
            // 设置边距选项
            if (result.marginEnabled !== undefined) {
                marginEnabledCheckbox.checked = result.marginEnabled;
                marginSettings.style.display = result.marginEnabled ? 'block' : 'none';
            }
            
            if (result.marginSize !== undefined) {
                marginSizeInput.value = result.marginSize;
            }
            
            console.log('设置已恢复:', result);
        });
    }
    
    // 保存设置到存储
    function saveSettings() {
        const settings = {
            backgroundColor: document.querySelector('input[name="background"]:checked').value,
            maxWidth: sizeSelect.value,
            marginEnabled: marginEnabledCheckbox.checked,
            marginSize: parseInt(marginSizeInput.value) || 50
        };
        
        chrome.storage.sync.set(settings, function() {
            console.log('设置已保存:', settings);
        });
    }
    
    // 获取当前标签页ID
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        currentTabId = tabs[0].id;
        loadSettings(); // 先恢复设置
        checkToolStatus();
    });
    
    // 检查工具状态
    function checkToolStatus() {
        if (!currentTabId) return;
        
        chrome.tabs.sendMessage(currentTabId, {action: 'getStatus'}, function(response) {
            if (chrome.runtime.lastError) {
                // 工具未注入
                updateUI('inactive');
            } else if (response) {
                updateUI(response.status);
            } else {
                updateUI('inactive');
            }
        });
    }
    
    // 更新UI状态
    function updateUI(status) {
        toolStatus = status;
        
        switch (status) {
            case 'inactive':
                statusDot.className = 'status-dot';
                statusText.textContent = '点击开始选择';
                startButton.innerHTML = `开始选择`;
                startButton.className = 'action-button btn-primary';
                startButton.style.display = 'block';
                stopButton.style.display = 'none';
                deactivateButton.style.display = 'none';
                break;
                
            case 'ready':
                statusDot.className = 'status-dot active';
                statusText.textContent = '点击开始选择';
                startButton.innerHTML = `开始选择`;
                startButton.className = 'action-button btn-success';
                startButton.style.display = 'block';
                stopButton.style.display = 'none';
                deactivateButton.style.display = 'none';
                break;
                
            case 'selecting':
                statusDot.className = 'status-dot active';
                statusText.textContent = '正在选择元素...';
                startButton.style.display = 'none';
                stopButton.style.display = 'block';
                deactivateButton.style.display = 'none';
                break;
                
            case 'downloading':
                statusDot.className = 'status-dot downloading';
                statusText.textContent = '正在导出下载...';
                startButton.style.display = 'none';
                stopButton.style.display = 'block';
                deactivateButton.style.display = 'none';
                break;
        }
    }
    
    // 开始按钮点击事件
    startButton.addEventListener('click', function() {
        if (!currentTabId) return;
        
        // 只有在未激活或就绪状态才显示开始按钮
        if (toolStatus === 'inactive' || toolStatus === 'ready') {
            startExport(); // 激活并开始选择
        }
    });
    
    // 停止按钮点击事件（反激活工具）
    stopButton.addEventListener('click', function() {
        if (!currentTabId) return;
        
        chrome.tabs.sendMessage(currentTabId, {action: 'deactivate'}, function(response) {
            if (response && response.success) {
                updateUI('inactive');
            }
        });
    });
    
    // 关闭工具按钮点击事件
    deactivateButton.addEventListener('click', function() {
        if (!currentTabId) return;
        
        chrome.tabs.sendMessage(currentTabId, {action: 'deactivate'}, function(response) {
            if (response && response.success) {
                updateUI('inactive');
            }
        });
    });
    
    // 激活工具
    function activateTool() {
        return new Promise((resolve, reject) => {
            chrome.scripting.executeScript({
                target: {tabId: currentTabId},
                files: ['html-exporter-combined.js']
            }, function() {
                if (chrome.runtime.lastError) {
                    console.error('注入脚本失败:', chrome.runtime.lastError);
                    statusText.textContent = '激活失败，请刷新页面重试';
                    reject(chrome.runtime.lastError);
                    return;
                }
                
                // 等待脚本初始化
                setTimeout(() => {
                    updateSettings();
                    updateUI('ready');
                    resolve();
                }, 500);
            });
        });
    }
    
    // 开始导出（合并了激活、选择和导出逻辑）
    function startExport() {
        if (toolStatus === 'inactive') {
            // 先激活工具
            activateTool().then(() => {
                // 激活成功后开始选择
                setTimeout(() => {
                    startSelection();
                }, 300);
            });
        } else {
            // 已激活，直接开始选择
            startSelection();
        }
    }
    
    // 开始选择
    function startSelection() {
        updateSettings(); // 更新设置
        
        chrome.tabs.sendMessage(currentTabId, {action: 'startSelection'}, function(response) {
            if (response && response.success) {
                updateUI('selecting');
            }
        });
    }
    
    // 取消选择
    function cancelSelection() {
        chrome.tabs.sendMessage(currentTabId, {action: 'cancelSelection'}, function(response) {
            if (response && response.success) {
                updateUI('ready');
            }
        });
    }
    
    // 更新设置到content script
    function updateSettings() {
        const settings = {
            backgroundColor: document.querySelector('input[name="background"]:checked').value,
            maxWidth: sizeSelect.value,
            marginEnabled: marginEnabledCheckbox.checked,
            marginSize: parseInt(marginSizeInput.value) || 50
        };
        
        // 保存设置到本地存储
        saveSettings();
        
        // 发送设置到content script
        if (currentTabId) {
            chrome.tabs.sendMessage(currentTabId, {
                action: 'updateSettings',
                settings: settings
            });
        }
    }
    
    // 监听设置变化
    backgroundRadios.forEach(radio => {
        radio.addEventListener('change', updateSettings);
    });
    
    sizeSelect.addEventListener('change', updateSettings);
    
    // 边距功能事件监听
    marginEnabledCheckbox.addEventListener('change', function() {
        marginSettings.style.display = this.checked ? 'block' : 'none';
        updateSettings();
    });
    
    marginSizeInput.addEventListener('change', updateSettings);
    
    // 监听来自content script的状态更新
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'statusUpdate') {
            updateUI(request.status);
        }
    });
    
    // 定期检查状态（防止状态不同步）
    setInterval(checkToolStatus, 2000);
});