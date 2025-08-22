/**
 * HTML导出PNG工具 - 轻量级单文件解决方案
 * 使用方式：在页面底部添加 <script src="html-to-png-exporter.js"></script>
 */
(function() {
    'use strict';
    
    // 确保只初始化一次
    if (window.htmlToPngExporter) return;
    window.htmlToPngExporter = true;
    
    let isSelectionMode = false;
    let selectedElement = null;
    let currentHoveredElement = null; // 跟踪当前悬停的元素
    let exportButton = null;
    let settingsButton = null;
    let stopButton = null;
    let exportDialog = null;
    let settingsPanel = null;
    let highlightOverlay = null;
    let blockingOverlay = null;
    let isDownloading = false;
    let currentToast = null;
    
    // 全局设置
    let globalSettings = {
        backgroundColor: 'transparent',
        maxWidth: 'original',
        marginEnabled: false,
        marginSize: 50
    };
    
    // 工具状态管理
    let toolStatus = 'inactive'; // inactive, ready, selecting, downloading
    let toastContainer = null;
    
    // 样式常量
    const STYLES = {
        buttonContainer: `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-end;
        `,
        mainPanel: `
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 240px;
        `,
        statusIndicator: `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
        `,
        statusDot: `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #6c757d;
        `,
        statusDotActive: `
            background: #28a745;
            animation: pulse 2s infinite;
        `,
        statusDotDownloading: `
            background: #17a2b8;
            animation: pulse 1s infinite;
        `,
        button: `
            width: 100%;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,123,255,0.3);
            transition: all 0.2s ease;
            user-select: none;
            margin-bottom: 8px;
        `,
        buttonSuccess: `
            background: #28a745;
        `,
        buttonDanger: `
            background: #dc3545;
        `,
        settingsButton: `
            width: 40px;
            height: 40px;
            padding: 8px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(108,117,125,0.3);
            transition: all 0.2s ease;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `,
        stopButton: `
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(220,53,69,0.3);
            transition: all 0.2s ease;
            user-select: none;
            min-width: 80px;
            display: none;
        `,
        buttonHover: `
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,123,255,0.4);
        `,
        overlay: `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            border: 3px solid #007bff;
            background: rgba(0,123,255,0.1);
            z-index: 999998;
            transition: all 0.1s ease;
        `,
        blockingOverlay: `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: transparent;
            z-index: 999997;
            pointer-events: auto;
            cursor: crosshair;
        `,
        dialog: `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000000;
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 300px;
        `,
        dialogBackdrop: `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999999;
        `,
        settingsPanel: `
            position: fixed;
            bottom: 60px;
            right: 20px;
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 240px;
            z-index: 1000000;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
            pointer-events: none;
        `,
        settingsPanelShow: `
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        `,
        toastContainer: `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `,
        toast: `
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(40,167,69,0.3);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 200px;
            pointer-events: auto;
        `,
        toastShow: `
            opacity: 1;
            transform: translateX(0);
        `,
        toastSuccess: `
            background: #28a745;
        `,
        toastInfo: `
            background: #17a2b8;
        `,
        toastError: `
            background: #dc3545;
        `,
        keyframes: `
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `
    };
    
    // 创建Toast容器
    function createToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.style.cssText = STYLES.toastContainer;
            toastContainer.setAttribute('data-html-exporter', 'toast-container');
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }
    
    // 显示Toast提示（支持堆叠）
    function showToast(message, type = 'success', duration = 3000) {
        const container = createToastContainer();
        
        // 创建新的toast
        const toast = document.createElement('div');
        toast.style.cssText = STYLES.toast;
        toast.setAttribute('data-html-exporter', 'toast');
        
        // 添加图标
        let icon = '';
        if (type === 'success') {
            toast.style.cssText += STYLES.toastSuccess;
            icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>`;
        } else if (type === 'info') {
            toast.style.cssText += STYLES.toastInfo;
            icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>`;
        } else if (type === 'error') {
            toast.style.cssText += STYLES.toastError;
            icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>`;
        }
        
        toast.innerHTML = `${icon}<span>${message}</span>`;
        container.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.cssText += STYLES.toastShow;
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                    // 如果容器为空，清理容器
                    if (container.children.length === 0) {
                        container.remove();
                        toastContainer = null;
                    }
                }
            }, 300);
        }, duration);
        
        return toast;
    }

    // 创建主面板
    function createMainPanel() {
        // 添加CSS动画到页面
        if (!document.getElementById('html-exporter-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'html-exporter-styles';
            styleElement.textContent = STYLES.keyframes;
            document.head.appendChild(styleElement);
        }
        
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = STYLES.buttonContainer;
        buttonContainer.setAttribute('data-html-exporter', 'container');
        
        // 创建设置面板
        createSettingsPanel();
        
        // 创建主面板
        const mainPanel = document.createElement('div');
        mainPanel.style.cssText = STYLES.mainPanel;
        mainPanel.setAttribute('data-html-exporter', 'main-panel');
        
        // 状态指示器
        const statusIndicator = document.createElement('div');
        statusIndicator.style.cssText = STYLES.statusIndicator;
        statusIndicator.innerHTML = `
            <div id="statusDot" style="${STYLES.statusDot}"></div>
            <div id="statusText" style="font-size: 13px; color: #495057; font-weight: 500;">工具未激活</div>
        `;
        
        // 主按钮
        exportButton = document.createElement('button');
        exportButton.id = 'startButton';
        exportButton.textContent = '开始选择';
        exportButton.style.cssText = STYLES.button;
        exportButton.setAttribute('data-html-exporter', 'export');
        exportButton.addEventListener('click', handleMainButtonClick);
        
        // 停止按钮
        stopButton = document.createElement('button');
        stopButton.id = 'stopButton';
        stopButton.textContent = '停止';
        stopButton.style.cssText = STYLES.button + STYLES.buttonDanger;
        stopButton.style.display = 'none';
        stopButton.setAttribute('data-html-exporter', 'stop');
        stopButton.addEventListener('click', handleStopButtonClick);
        
        // 组装主面板
        mainPanel.appendChild(statusIndicator);
        mainPanel.appendChild(exportButton);
        mainPanel.appendChild(stopButton);
        
        // 创建设置按钮（齿轮图标）
        settingsButton = document.createElement('button');
        settingsButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97L2.46 14.6c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L19.43 13z"/>
            </svg>
        `;
        settingsButton.style.cssText = STYLES.settingsButton;
        settingsButton.setAttribute('data-html-exporter', 'settings');
        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSettingsPanel();
        });
        
        // 设置按钮hover效果
        settingsButton.addEventListener('mouseenter', () => {
            settingsButton.style.background = '#5a6268';
            settingsButton.style.transform = 'scale(1.05)';
        });
        
        settingsButton.addEventListener('mouseleave', () => {
            settingsButton.style.background = '#6c757d';
            settingsButton.style.transform = 'scale(1)';
        });
        
        // 组装按钮容器
        buttonContainer.appendChild(settingsButton);
        buttonContainer.appendChild(mainPanel);
        document.body.appendChild(buttonContainer);
        
        // 初始化状态
        updateUI(toolStatus);
    }
    
    // 创建设置面板
    function createSettingsPanel() {
        settingsPanel = document.createElement('div');
        settingsPanel.style.cssText = STYLES.settingsPanel;
        settingsPanel.setAttribute('data-html-exporter', 'settings-panel');
        
        settingsPanel.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">导出设置</h4>
                <div id="downloadStatus" style="display: none; width: 8px; height: 8px; background: #28a745; border-radius: 50%; animation: pulse 1s infinite;"></div>
            </div>
            <style>
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            </style>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; color: #555; font-size: 14px; font-weight: 500;">背景:</label>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 14px;">
                        <input type="radio" name="background" value="transparent" checked style="margin-right: 6px;">
                        透明
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 14px;">
                        <input type="radio" name="background" value="white" style="margin-right: 6px;">
                        白底
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; font-size: 14px;">
                        <input type="radio" name="background" value="original" style="margin-right: 6px;">
                        原文档
                    </label>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; color: #555; font-size: 14px; font-weight: 500;">尺寸:</label>
                <select id="sizeSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                    <option value="original">原始尺寸</option>
                    <option value="800">800px宽</option>
                    <option value="1200">1200px宽</option>
                    <option value="1600">1600px宽</option>
                    <option value="1920">1920px宽</option>
                </select>
            </div>
            
            <div style="margin-bottom: 0;">
                <label style="display: flex; align-items: center; margin-bottom: 8px; color: #555; font-size: 14px; font-weight: 500; cursor: pointer;">
                    <input type="checkbox" id="marginEnabled" style="margin-right: 8px;">
                    增加边距
                </label>
                <div id="marginSettings" style="display: none; margin-left: 20px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
                    <div style="margin-bottom: 8px;">
                        <label style="display: block; margin-bottom: 4px; color: #666; font-size: 13px;">边距大小:</label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="number" id="marginSize" value="50" min="0" max="200" style="width: 80px; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
                            <span style="color: #666; font-size: 13px;">px</span>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #888; line-height: 1.4;">
                        边距背景将跟随上方的背景设置
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsPanel);
        
        // 绑定设置变化事件
        const bgRadios = settingsPanel.querySelectorAll('input[name="background"]');
        bgRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'transparent') {
                    globalSettings.backgroundColor = 'transparent';
                } else if (e.target.value === 'white') {
                    globalSettings.backgroundColor = '#ffffff';
                } else if (e.target.value === 'original') {
                    globalSettings.backgroundColor = 'original';
                }
            });
        });
        
        const sizeSelect = settingsPanel.querySelector('#sizeSelect');
        sizeSelect.addEventListener('change', (e) => {
            globalSettings.maxWidth = e.target.value;
        });
        
        // 边距功能事件绑定
        const marginEnabledCheckbox = settingsPanel.querySelector('#marginEnabled');
        const marginSettings = settingsPanel.querySelector('#marginSettings');
        const marginSizeInput = settingsPanel.querySelector('#marginSize');
        
        marginEnabledCheckbox.addEventListener('change', function() {
            globalSettings.marginEnabled = this.checked;
            if (this.checked) {
                marginSettings.style.display = 'block';
            } else {
                marginSettings.style.display = 'none';
            }
        });
        
        marginSizeInput.addEventListener('change', function() {
            globalSettings.marginSize = parseInt(this.value) || 50;
        });
    }
    
    // 切换设置面板显示
    function toggleSettingsPanel() {
        const isVisible = settingsPanel.classList.contains('settings-panel-show');
        
        if (isVisible) {
            hideSettingsPanel();
        } else {
            showSettingsPanel();
        }
    }
    
    // 显示设置面板
    function showSettingsPanel() {
        settingsPanel.classList.add('settings-panel-show');
        settingsPanel.style.opacity = '1';
        settingsPanel.style.transform = 'translateY(0)';
        settingsPanel.style.pointerEvents = 'auto';
        
        // 添加点击外部关闭的事件监听，延迟以避免立即触发
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick, true);
        }, 150);
    }
    
    // 隐藏设置面板
    function hideSettingsPanel() {
        if (settingsPanel && settingsPanel.classList.contains('settings-panel-show')) {
            settingsPanel.classList.remove('settings-panel-show');
            settingsPanel.style.opacity = '0';
            settingsPanel.style.transform = 'translateY(10px)';
            settingsPanel.style.pointerEvents = 'none';
            document.removeEventListener('click', handleOutsideClick, true);
        }
    }
    
    // 处理点击外部关闭设置面板
    function handleOutsideClick(e) {
        const isSettingsArea = settingsPanel.contains(e.target) || settingsButton.contains(e.target);
        const isPanelVisible = settingsPanel.classList.contains('settings-panel-show');
        
        if (!isSettingsArea && isPanelVisible) {
            hideSettingsPanel();
        }
    }
    
    // 更新UI状态
    function updateUI(status) {
        toolStatus = status;
        
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        
        if (!statusDot || !statusText || !startButton || !stopButton) return;
        
        switch (status) {
            case 'inactive':
                statusDot.style.cssText = STYLES.statusDot;
                statusText.textContent = '点击开始选择';
                startButton.textContent = '开始选择';
                startButton.style.cssText = STYLES.button;
                startButton.style.display = 'block';
                stopButton.style.display = 'none';
                break;
                
            case 'ready':
                statusDot.style.cssText = STYLES.statusDot + STYLES.statusDotActive;
                statusText.textContent = '点击开始选择';
                startButton.textContent = '开始选择';
                startButton.style.cssText = STYLES.button + STYLES.buttonSuccess;
                startButton.style.display = 'block';
                stopButton.style.display = 'none';
                break;
                
            case 'selecting':
                statusDot.style.cssText = STYLES.statusDot + STYLES.statusDotActive;
                statusText.textContent = '正在选择元素...';
                startButton.style.display = 'none';
                stopButton.style.display = 'block';
                break;
                
            case 'downloading':
                statusDot.style.cssText = STYLES.statusDot + STYLES.statusDotDownloading;
                statusText.textContent = '正在导出下载...';
                startButton.style.display = 'none';
                stopButton.style.display = 'block';
                break;
        }
    }
    
    // 处理主按钮点击
    function handleMainButtonClick() {
        // 只有在未激活或就绪状态才显示开始按钮
        if (toolStatus === 'inactive' || toolStatus === 'ready') {
            startExport(); // 激活并开始选择
        }
    }
    
    // 处理停止按钮点击
    function handleStopButtonClick() {
        if (toolStatus === 'selecting') {
            exitSelectionMode();
            updateUI('ready');
        } else if (toolStatus === 'downloading') {
            stopDownloadProcess();
        }
    }
    
    // 开始导出（合并了激活、选择和导出逻辑）
    function startExport() {
        if (toolStatus === 'inactive') {
            // 先激活工具
            updateUI('ready');
            // 激活成功后开始选择
            setTimeout(() => {
                startSelection();
            }, 300);
        } else {
            // 已激活，直接开始选择
            startSelection();
        }
    }
    
    // 开始选择
    function startSelection() {
        updateSettings(); // 更新设置
        updateUI('selecting');
        enterSelectionMode();
    }
    
    // 更新设置
    function updateSettings() {
        const bgRadios = document.querySelectorAll('[data-html-exporter="settings-panel"] input[name="background"]');
        const sizeSelect = document.querySelector('[data-html-exporter="settings-panel"] #sizeSelect');
        
        if (bgRadios.length > 0) {
            for (const radio of bgRadios) {
                if (radio.checked) {
                    if (radio.value === 'transparent') {
                        globalSettings.backgroundColor = 'transparent';
                    } else if (radio.value === 'white') {
                        globalSettings.backgroundColor = '#ffffff';
                    } else if (radio.value === 'original') {
                        globalSettings.backgroundColor = 'original';
                    }
                    break;
                }
            }
        }
        
        if (sizeSelect) {
            globalSettings.maxWidth = sizeSelect.value;
        }
    }
    
    // 处理导出按钮点击（保留兼容性）
    function handleExportClick() {
        handleMainButtonClick();
    }
    
    // 直接导出（无对话框）
    function performDirectExport() {
        if (!selectedElement || toolStatus === 'downloading') return;
        
        updateUI('downloading');
        isDownloading = true;
        
        // 显示下载开始的toast
        showToast('开始导出...', 'info', 2000);
        
        const backgroundColor = globalSettings.backgroundColor;
        const maxWidth = globalSettings.maxWidth;
        const marginEnabled = globalSettings.marginEnabled;
        const marginSize = marginEnabled ? globalSettings.marginSize : 0;
        
        console.log('开始导出...', { backgroundColor, maxWidth, marginEnabled, marginSize });
        
        // 预先处理页面中的oklch颜色，防止html2canvas解析错误
        const originalStyles = new Map();
        try {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                const fixes = {};
                
                // 检查并临时替换oklch颜色
                if (computedStyle.color && computedStyle.color.includes('oklch')) {
                    fixes.color = el.style.color;
                    el.style.setProperty('color', 'rgb(0, 0, 0)', 'important');
                }
                if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
                    fixes.backgroundColor = el.style.backgroundColor;
                    el.style.setProperty('background-color', 'transparent', 'important');
                }
                if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
                    fixes.borderColor = el.style.borderColor;
                    el.style.setProperty('border-color', 'rgb(0, 0, 0)', 'important');
                }
                
                if (Object.keys(fixes).length > 0) {
                    originalStyles.set(el, fixes);
                }
            });
            console.log(`预处理了 ${originalStyles.size} 个包含oklch的元素`);
        } catch (preError) {
            console.warn('预处理oklch颜色时出错:', preError);
        }
        
        // 根据背景设置配置html2canvas选项
        const canvasOptions = {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            logging: false,
            width: maxWidth === 'original' ? undefined : parseInt(maxWidth),
            height: undefined,
            ignoreElements: function(element) {
                // 忽略可能包含不支持CSS的元素
                return false;
            },
            onclone: function(clonedDoc) {
                // 在克隆的文档中移除可能导致问题的CSS样式
                try {
                    // 只处理oklch颜色问题，保持其他样式不变
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach(el => {
                        try {
                            const computedStyle = window.getComputedStyle(el);
                            
                            // 只替换包含oklch的颜色，保持其他背景样式
                            if (computedStyle.color && computedStyle.color.includes('oklch')) {
                                el.style.color = 'rgb(0, 0, 0)';
                            }
                            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
                                // 如果是原文档背景模式，尝试从父元素获取背景色
                                if (backgroundColor === 'original' && el.parentElement) {
                                    const parentBg = window.getComputedStyle(el.parentElement).backgroundColor;
                                    if (parentBg && !parentBg.includes('oklch') && parentBg !== 'rgba(0, 0, 0, 0)') {
                                        el.style.backgroundColor = parentBg;
                                    } else {
                                        el.style.backgroundColor = 'transparent';
                                    }
                                } else {
                                    el.style.backgroundColor = 'transparent';
                                }
                            }
                            if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
                                el.style.borderColor = 'rgb(0, 0, 0)';
                            }
                        } catch (styleError) {
                            // 忽略单个元素的样式错误
                        }
                    });
                    
                    // 确保body和html元素保持原始背景（如果是原文档模式）
                    if (backgroundColor === 'original') {
                        const bodyEl = clonedDoc.body;
                        const htmlEl = clonedDoc.documentElement;
                        
                        // 保持body的原始背景
                        if (bodyEl && !window.getComputedStyle(bodyEl).backgroundColor.includes('oklch')) {
                            const originalBodyBg = window.getComputedStyle(document.body).backgroundColor;
                            if (originalBodyBg && originalBodyBg !== 'rgba(0, 0, 0, 0)') {
                                bodyEl.style.backgroundColor = originalBodyBg;
                            }
                        }
                        
                        // 保持html的原始背景
                        if (htmlEl && !window.getComputedStyle(htmlEl).backgroundColor.includes('oklch')) {
                            const originalHtmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
                            if (originalHtmlBg && originalHtmlBg !== 'rgba(0, 0, 0, 0)') {
                                htmlEl.style.backgroundColor = originalHtmlBg;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('清理oklch颜色时出错:', e);
                }
                return clonedDoc;
            }
        };
        
        // 根据背景设置配置backgroundColor
        if (backgroundColor === 'original') {
            // 原文档背景：设置为null让html2canvas使用透明背景，这样能保持元素的原始背景
            canvasOptions.backgroundColor = null;
        } else {
            canvasOptions.backgroundColor = backgroundColor;
        }
        
        html2canvas(selectedElement, canvasOptions).then(canvas => {
            console.log('Canvas创建成功:', canvas.width + 'x' + canvas.height);
            
            let finalCanvas = canvas;
            
            // 如果启用了边距功能，创建带边距的画布
            if (marginSize > 0) {
                console.log('开始处理边距功能...');
                
                // 创建新的画布，尺寸为原画布 + 边距
                const newCanvas = document.createElement('canvas');
                const newWidth = canvas.width + marginSize * 2;
                const newHeight = canvas.height + marginSize * 2;
                newCanvas.width = newWidth;
                newCanvas.height = newHeight;
                
                const ctx = newCanvas.getContext('2d');
                
                // 设置边距背景（跟随主背景设置）
                if (backgroundColor === '#ffffff') {
                    // 白色背景
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, newWidth, newHeight);
                } else if (backgroundColor === 'original') {
                    // 原文档背景：获取页面背景色
                    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                    const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
                    const pageBackground = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : (htmlBg !== 'rgba(0, 0, 0, 0)' ? htmlBg : '#ffffff');
                    ctx.fillStyle = pageBackground;
                    ctx.fillRect(0, 0, newWidth, newHeight);
                }
                // 透明背景不需要填充
                
                // 将原始截图放在新画布的中心
                ctx.drawImage(canvas, marginSize, marginSize);
                
                finalCanvas = newCanvas;
                console.log('边距处理完成，新尺寸:', newWidth + 'x' + newHeight);
            }
            
            // 恢复原始样式
            try {
                originalStyles.forEach((fixes, el) => {
                    Object.keys(fixes).forEach(prop => {
                        if (fixes[prop]) {
                            el.style[prop] = fixes[prop];
                        } else {
                            el.style.removeProperty(prop);
                        }
                    });
                });
                console.log('已恢复原始样式');
            } catch (restoreError) {
                console.warn('恢复原始样式时出错:', restoreError);
            }
            
            try {
                const link = document.createElement('a');
                const fileName = `html-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.download = fileName;
                link.href = finalCanvas.toDataURL('image/png');
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('图片下载完成:', fileName);
                
                // 显示下载成功的toast
                showToast('下载成功！继续选择下一个元素', 'success', 2000);
                
                // 下载完成后，自动重新进入选择模式
                setTimeout(() => {
                    if (toolStatus === 'downloading') { // 确保用户没有点击停止
                        selectedElement = null;
                        isDownloading = false;
                        startSelection(); // 重新进入选择模式
                    }
                }, 800);
                
            } catch (error) {
                console.error('下载过程出错:', error);
                showToast('下载失败，请重试', 'error', 3000);
                stopDownloadProcess();
            }
            
        }).catch(error => {
            console.error('导出失败:', error);
            
            // 恢复原始样式
            try {
                originalStyles.forEach((fixes, el) => {
                    Object.keys(fixes).forEach(prop => {
                        if (fixes[prop]) {
                            el.style[prop] = fixes[prop];
                        } else {
                            el.style.removeProperty(prop);
                        }
                    });
                });
                console.log('已恢复原始样式');
            } catch (restoreError) {
                console.warn('恢复原始样式时出错:', restoreError);
            }
            
            // 如果是oklch颜色错误，提供更具体的错误信息
            if (error.message && error.message.includes('oklch')) {
                showToast('检测到不支持的CSS颜色格式，正在尝试备用方案...', 'info', 2000);
                
                // 尝试使用简化的配置重新导出
                setTimeout(() => {
                    const fallbackOptions = {
                        allowTaint: true,
                        useCORS: true,
                        scale: 1, // 降低精度
                        logging: false,
                        backgroundColor: backgroundColor === 'original' ? null : backgroundColor,
                        removeContainer: true,
                        foreignObjectRendering: false // 禁用可能有问题的渲染
                    };
                    
                    html2canvas(selectedElement, fallbackOptions).then(canvas => {
                        console.log('备用方案导出成功:', canvas.width + 'x' + canvas.height);
                        
                        let finalCanvas = canvas;
                        
                        // 备用方案也支持边距功能
                        if (marginSize > 0) {
                            console.log('备用方案：开始处理边距功能...');
                            
                            const newCanvas = document.createElement('canvas');
                            const newWidth = canvas.width + marginSize * 2;
                            const newHeight = canvas.height + marginSize * 2;
                            newCanvas.width = newWidth;
                            newCanvas.height = newHeight;
                            
                            const ctx = newCanvas.getContext('2d');
                            
                            if (backgroundColor === '#ffffff') {
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, newWidth, newHeight);
                            } else if (backgroundColor === 'original') {
                                const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                                const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
                                const pageBackground = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : (htmlBg !== 'rgba(0, 0, 0, 0)' ? htmlBg : '#ffffff');
                                ctx.fillStyle = pageBackground;
                                ctx.fillRect(0, 0, newWidth, newHeight);
                            }
                            
                            ctx.drawImage(canvas, marginSize, marginSize);
                            finalCanvas = newCanvas;
                            console.log('备用方案：边距处理完成，新尺寸:', newWidth + 'x' + newHeight);
                        }
                        
                        try {
                            const link = document.createElement('a');
                            const fileName = `html-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                            link.download = fileName;
                            link.href = finalCanvas.toDataURL('image/png');
                            
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            showToast('备用方案导出成功！', 'success', 2000);
                            
                            setTimeout(() => {
                                if (toolStatus === 'downloading') {
                                    selectedElement = null;
                                    isDownloading = false;
                                    startSelection();
                                }
                            }, 800);
                            
                        } catch (downloadError) {
                            console.error('备用方案下载失败:', downloadError);
                            showToast('导出失败，请尝试选择其他元素', 'error', 3000);
                            stopDownloadProcess();
                        }
                    }).catch(fallbackError => {
                        console.error('备用方案也失败了:', fallbackError);
                        showToast('导出失败，请尝试选择其他元素', 'error', 3000);
                        stopDownloadProcess();
                    });
                }, 1000);
            } else {
                showToast('导出失败，请重试', 'error', 3000);
                stopDownloadProcess();
            }
        });
    }
    
    // 停止下载流程
    function stopDownloadProcess() {
        isDownloading = false;
        selectedElement = null;
        if (isSelectionMode) {
            exitSelectionMode();
        }
        updateUI('ready');
        showToast('已停止导出流程', 'info', 2000);
    }
    

    
    // 创建高亮覆盖层
    function createHighlightOverlay() {
        highlightOverlay = document.createElement('div');
        highlightOverlay.style.cssText = STYLES.overlay;
        highlightOverlay.style.display = 'none';
        highlightOverlay.setAttribute('data-html-exporter', 'overlay');
        document.body.appendChild(highlightOverlay);
    }
    
    // 创建阻止交互的覆盖层
    function createBlockingOverlay() {
        blockingOverlay = document.createElement('div');
        blockingOverlay.style.cssText = STYLES.blockingOverlay;
        blockingOverlay.style.display = 'none';
        blockingOverlay.setAttribute('data-html-exporter', 'blocking');
        document.body.appendChild(blockingOverlay);
    }
    
    // 切换选择模式（保留兼容性）
    function toggleSelectionMode() {
        handleExportClick();
    }
    
    // 进入选择模式
    function enterSelectionMode() {
        isSelectionMode = true;
        document.body.style.cursor = 'crosshair';
        
        // 隐藏设置面板
        hideSettingsPanel();
        
        // 显示提示
        showToast('左键点击选择元素，右键选择父级元素', 'info', 3000);
        
        // 添加事件监听器到阻塞覆盖层
        if (blockingOverlay) {
            blockingOverlay.addEventListener('mousemove', handleMouseMove, true);
            blockingOverlay.addEventListener('click', handleElementClick, true);
            blockingOverlay.addEventListener('contextmenu', handleRightClick, true);
        }
        
        // 添加键盘事件监听器到document
        document.addEventListener('keydown', handleKeyDown, true);
        
        // 显示覆盖层
        if (blockingOverlay && highlightOverlay) {
            blockingOverlay.style.display = 'block';
            highlightOverlay.style.display = 'block';
        }
    }
    
    // 退出选择模式
    function exitSelectionMode() {
        isSelectionMode = false;
        document.body.style.cursor = '';
        
        // 移除事件监听器
        if (blockingOverlay) {
            blockingOverlay.removeEventListener('mousemove', handleMouseMove, true);
            blockingOverlay.removeEventListener('click', handleElementClick, true);
            blockingOverlay.removeEventListener('contextmenu', handleRightClick, true);
        }
        document.removeEventListener('keydown', handleKeyDown, true);
        
        // 隐藏覆盖层
        if (highlightOverlay && blockingOverlay) {
            highlightOverlay.style.display = 'none';
            blockingOverlay.style.display = 'none';
        }
    }
    
    // 检查元素是否为工具相关元素
    function isToolElement(element) {
        if (!element) return true;
        
        // 检查是否为工具元素或其子元素
        const toolElement = element.closest('[data-html-exporter]');
        if (toolElement) return true;
        
        // 检查是否为特定的工具元素
        if (element === exportButton || element === settingsButton || element === stopButton || 
            element === highlightOverlay || element === blockingOverlay ||
            element === settingsPanel || element === toastContainer) {
            return true;
        }
        
        // 检查是否在工具容器内或Toast容器内
        const toolContainers = document.querySelectorAll('[data-html-exporter]');
        for (const container of toolContainers) {
            if (container.contains(element)) return true;
        }
        
        // 检查是否在Toast容器内
        if (toastContainer && toastContainer.contains(element)) {
            return true;
        }
        
        return false;
    }
    
    // 处理鼠标移动
    function handleMouseMove(e) {
        if (!isSelectionMode || !highlightOverlay || !blockingOverlay) {
            return;
        }
        
        // 暂时隐藏阻塞覆盖层来获取下面的元素
        blockingOverlay.style.display = 'none';
        const element = document.elementFromPoint(e.clientX, e.clientY);
        blockingOverlay.style.display = 'block';
        
        // 忽略工具相关元素
        if (isToolElement(element)) {
            highlightOverlay.style.display = 'none';
            currentHoveredElement = null;
            return;
        }
        
        // 更新当前悬停的元素
        currentHoveredElement = element;
        
        const rect = element.getBoundingClientRect();
        highlightOverlay.style.display = 'block';
        highlightOverlay.style.left = rect.left + 'px';
        highlightOverlay.style.top = rect.top + 'px';
        highlightOverlay.style.width = rect.width + 'px';
        highlightOverlay.style.height = rect.height + 'px';
    }
    
    // 处理元素点击
    function handleElementClick(e) {
        if (!isSelectionMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // 优先使用当前悬停的元素（可能是通过右键选择的父级）
        let element = currentHoveredElement;
        
        // 如果没有当前悬停元素，则获取鼠标位置的元素
        if (!element) {
            blockingOverlay.style.display = 'none';
            element = document.elementFromPoint(e.clientX, e.clientY);
            blockingOverlay.style.display = 'block';
        }
        
        // 忽略工具相关元素
        if (isToolElement(element)) return;
        
        selectedElement = element;
        exitSelectionMode();
        
        // 显示选择成功的提示
        const tagName = element.tagName.toLowerCase();
        const className = element.className ? '.' + element.className.split(' ')[0] : '';
        const id = element.id ? '#' + element.id : '';
        showToast(`已选择: ${tagName}${id}${className}`, 'success', 1000);
        
        // 选择元素后立即开始导出
        setTimeout(() => {
            performDirectExport();
        }, 200); // 给用户一点时间看到选择效果
    }
    
    // 处理右键点击 - 选择父级元素（不导出）
    function handleRightClick(e) {
        if (!isSelectionMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // 使用当前悬停的元素，如果没有则获取鼠标位置的元素
        let currentElement = currentHoveredElement;
        if (!currentElement) {
            // 暂时隐藏阻塞覆盖层来获取下面的元素
            blockingOverlay.style.display = 'none';
            currentElement = document.elementFromPoint(e.clientX, e.clientY);
            blockingOverlay.style.display = 'block';
        }
        
        // 忽略工具相关元素
        if (isToolElement(currentElement)) return;
        
        // 查找父级元素
        let parentElement = currentElement.parentElement;
        
        // 跳过工具相关的父级元素
        while (parentElement && isToolElement(parentElement)) {
            parentElement = parentElement.parentElement;
        }
        
        // 如果找到有效的父级元素
        if (parentElement && parentElement !== document.body && parentElement !== document.documentElement) {
            // 更新当前悬停元素为父级元素，支持连续右键
            currentHoveredElement = parentElement;
            
            // 更新高亮显示
            const rect = parentElement.getBoundingClientRect();
            if (highlightOverlay) {
                highlightOverlay.style.left = rect.left + 'px';
                highlightOverlay.style.top = rect.top + 'px';
                highlightOverlay.style.width = rect.width + 'px';
                highlightOverlay.style.height = rect.height + 'px';
                highlightOverlay.style.display = 'block';
            }
            
            // 显示父级元素信息，但不退出选择模式
            const tagName = parentElement.tagName.toLowerCase();
            const className = parentElement.className ? '.' + parentElement.className.split(' ')[0] : '';
            const id = parentElement.id ? '#' + parentElement.id : '';
            showToast(`已切换到父级: ${tagName}${id}${className}`, 'info', 1500);
        } else {
            // 已经是最顶级的元素了
            showToast('已经是最顶级的可选元素', 'warning', 1500);
        }
    }
    
    // 处理键盘事件
    function handleKeyDown(e) {
        if (e.key === 'Escape' && isSelectionMode) {
            exitSelectionMode();
            updateUI('ready');
        }
    }
    
    // 显示导出对话框（保留兼容性，但现在不再使用）
    function showExportDialog() {
        // 创建背景遮罩
        const backdrop = document.createElement('div');
        backdrop.style.cssText = STYLES.dialogBackdrop;
        backdrop.setAttribute('data-html-exporter', 'backdrop');
        
        // 创建对话框
        exportDialog = document.createElement('div');
        exportDialog.style.cssText = STYLES.dialog;
        exportDialog.setAttribute('data-html-exporter', 'dialog');
        
        exportDialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">导出设置</h3>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">最大宽度：</label>
                <select id="widthSelect" style="width: 100%; padding: 8px 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; background: white;">
                    <option value="800">800px</option>
                    <option value="1200">1200px</option>
                    <option value="1920">1920px</option>
                    <option value="original" selected>原始尺寸</option>
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">背景：</label>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="radio" name="background" value="transparent" checked style="margin: 0;">
                        <span style="font-size: 14px;">透明背景</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="radio" name="background" value="white" style="margin: 0;">
                        <span style="font-size: 14px;">白色背景</span>
                    </label>
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancelBtn" style="padding: 10px 20px; border: 2px solid #ddd; background: white; color: #666; border-radius: 6px; cursor: pointer; font-size: 14px;">取消</button>
                <button id="exportBtn" style="padding: 10px 20px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer; font-size: 14px;">导出PNG</button>
            </div>
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(exportDialog);
        
        // 绑定事件
        document.getElementById('cancelBtn').addEventListener('click', closeExportDialog);
        document.getElementById('exportBtn').addEventListener('click', performExport);
        backdrop.addEventListener('click', closeExportDialog);
        
        // ESC键关闭
        function handleDialogKeyDown(e) {
            if (e.key === 'Escape') {
                closeExportDialog();
            }
        }
        document.addEventListener('keydown', handleDialogKeyDown);
        
        function closeExportDialog() {
            document.removeEventListener('keydown', handleDialogKeyDown);
            backdrop.remove();
            exportDialog.remove();
            selectedElement = null;
        }
    }
    
    // 执行导出（保留兼容性，但现在不再使用）
    function performExport() {
        const widthSelect = document.getElementById('widthSelect');
        const maxWidth = widthSelect.value;
        
        // 获取背景选项
        const backgroundRadios = document.getElementsByName('background');
        let backgroundColor = null; // 默认透明
        for (const radio of backgroundRadios) {
            if (radio.checked) {
                backgroundColor = radio.value === 'white' ? '#ffffff' : null;
                break;
            }
        }
        
        // 显示导出进度
        const exportBtn = document.getElementById('exportBtn');
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '导出中...';
        exportBtn.disabled = true;
        
        // 使用html2canvas进行截图
        html2canvas(selectedElement, {
            allowTaint: true,
            useCORS: true,
            scale: 2, // 高清导出
            backgroundColor: backgroundColor, // 根据用户选择设置背景
            logging: false, // 关闭日志
            width: maxWidth === 'original' ? undefined : parseInt(maxWidth),
            height: undefined,
            onclone: function(clonedDoc) {
                // 确保克隆的文档样式正确
                return clonedDoc;
            }
        }).then(canvas => {
            console.log('Canvas创建成功:', canvas.width + 'x' + canvas.height);
            
            // 显示成功状态
            exportBtn.textContent = '导出成功！';
            exportBtn.style.background = '#28a745';
            
            try {
                // 创建下载链接
                const link = document.createElement('a');
                const fileName = `export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.download = fileName;
                link.href = canvas.toDataURL('image/png');
                
                console.log('准备下载文件:', fileName);
                
                // 触发下载
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('下载链接已触发');
                
            } catch (downloadError) {
                console.error('下载过程出错:', downloadError);
                exportBtn.textContent = '下载失败';
                exportBtn.style.background = '#dc3545';
            }
            
            // 延迟关闭对话框，让用户看到成功提示
            setTimeout(() => {
                // 查找并点击取消按钮来关闭对话框
                const cancelBtn = document.getElementById('cancelBtn');
                if (cancelBtn) {
                    cancelBtn.click();
                }
            }, 1500);
            
        }).catch(error => {
            console.error('导出失败:', error);
            exportBtn.textContent = '导出失败';
            exportBtn.style.background = '#dc3545';
            
            // 延迟恢复按钮状态
            setTimeout(() => {
                exportBtn.textContent = originalText;
                exportBtn.style.background = '#007bff';
                exportBtn.disabled = false;
            }, 2000);
        });
    }
    
    // 动态加载html2canvas库
    function loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (window.html2canvas) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // 初始化
    function init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // 加载html2canvas库
        loadHtml2Canvas().then(() => {
            // 创建UI元素
            createMainPanel();
            createHighlightOverlay();
            createBlockingOverlay();
            
            // HTML导出PNG工具已加载完成
        }).catch(error => {
            console.error('加载html2canvas库失败:', error);
            showToast('工具初始化失败，请检查网络连接', 'error', 5000);
        });
    }
    
    // 启动
    init();
})();