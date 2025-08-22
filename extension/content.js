// Content Script - 监听来自popup的消息
(function() {
    'use strict';
    
    let isToolActive = false;
    
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch(request.action) {
            case 'getStatus':
                sendResponse({status: isToolActive ? 'ready' : 'inactive'});
                break;
                
            case 'checkStatus':
                sendResponse({isActive: isToolActive});
                break;
                
            case 'activate':
                activateTool();
                sendResponse({success: true});
                break;
                
            case 'deactivate':
                deactivateTool();
                sendResponse({success: true});
                break;
                
            case 'startSelection':
                if (window.htmlToPngExporter && window.htmlToPngExporter.startSelection) {
                    window.htmlToPngExporter.startSelection();
                    sendResponse({success: true});
                } else {
                    sendResponse({success: false});
                }
                break;
                
            case 'cancelSelection':
                if (window.htmlToPngExporter && window.htmlToPngExporter.cancelSelection) {
                    window.htmlToPngExporter.cancelSelection();
                    sendResponse({success: true});
                } else {
                    sendResponse({success: false});
                }
                break;
                
            case 'updateSettings':
                if (window.htmlToPngExporter && window.htmlToPngExporter.updateSettings) {
                    window.htmlToPngExporter.updateSettings(request.settings);
                    sendResponse({success: true});
                } else {
                    sendResponse({success: false});
                }
                break;
        }
    });
    
    // 激活工具
    function activateTool() {
        if (isToolActive) return;
        
        isToolActive = true;
        
        // 通知background更新状态
        chrome.runtime.sendMessage({
            action: 'statusUpdate',
            isActive: true
        });
        
        console.log('HTML导出PNG工具已激活');
    }
    
    // 停用工具
    function deactivateTool() {
        if (!isToolActive) return;
        
        isToolActive = false;
        
        // 移除工具相关元素
        const exportButton = document.querySelector('[data-html-exporter="button"]');
        const highlightOverlay = document.querySelector('[data-html-exporter="overlay"]');
        const dialogs = document.querySelectorAll('[data-html-exporter="dialog"]');
        const backdrops = document.querySelectorAll('[data-html-exporter="backdrop"]');
        
        if (exportButton) exportButton.remove();
        if (highlightOverlay) highlightOverlay.remove();
        dialogs.forEach(dialog => dialog.remove());
        backdrops.forEach(backdrop => backdrop.remove());
        
        // 重置页面样式
        document.body.style.cursor = '';
        
        // 清除全局工具标记，允许重新初始化
        if (window.htmlToPngExporter) {
            delete window.htmlToPngExporter;
        }
        
        // 通知background更新状态
        chrome.runtime.sendMessage({
            action: 'statusUpdate', 
            isActive: false
        });
        
        console.log('HTML导出PNG工具已停用');
    }
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        deactivateTool();
    });
    
})();
