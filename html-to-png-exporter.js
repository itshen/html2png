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
    let exportButton = null;
    let exportDialog = null;
    let highlightOverlay = null;
    
    // 样式常量
    const STYLES = {
        button: `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            transition: all 0.2s ease;
            user-select: none;
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
        `
    };
    
    // 创建导出按钮
    function createExportButton() {
        exportButton = document.createElement('button');
        exportButton.textContent = '导出';
        exportButton.style.cssText = STYLES.button;
        
        exportButton.addEventListener('mouseenter', () => {
            if (!isSelectionMode) {
                exportButton.style.cssText = STYLES.button + STYLES.buttonHover;
            }
        });
        
        exportButton.addEventListener('mouseleave', () => {
            exportButton.style.cssText = STYLES.button;
        });
        
        exportButton.addEventListener('click', toggleSelectionMode);
        document.body.appendChild(exportButton);
    }
    
    // 创建高亮覆盖层
    function createHighlightOverlay() {
        highlightOverlay = document.createElement('div');
        highlightOverlay.style.cssText = STYLES.overlay;
        highlightOverlay.style.display = 'none';
        document.body.appendChild(highlightOverlay);
    }
    
    // 切换选择模式
    function toggleSelectionMode() {
        if (isSelectionMode) {
            exitSelectionMode();
        } else {
            enterSelectionMode();
        }
    }
    
    // 进入选择模式
    function enterSelectionMode() {
        isSelectionMode = true;
        exportButton.textContent = '取消';
        exportButton.style.background = '#dc3545';
        document.body.style.cursor = 'crosshair';
        
        // 添加事件监听器
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleElementClick);
        document.addEventListener('keydown', handleKeyDown);
        
        highlightOverlay.style.display = 'block';
    }
    
    // 退出选择模式
    function exitSelectionMode() {
        isSelectionMode = false;
        exportButton.textContent = '导出';
        exportButton.style.background = '#007bff';
        document.body.style.cursor = '';
        
        // 移除事件监听器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleElementClick);
        document.removeEventListener('keydown', handleKeyDown);
        
        highlightOverlay.style.display = 'none';
    }
    
    // 处理鼠标移动
    function handleMouseMove(e) {
        if (!isSelectionMode) return;
        
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element || element === exportButton || element === highlightOverlay) return;
        
        const rect = element.getBoundingClientRect();
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
        
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element || element === exportButton || element === highlightOverlay) return;
        
        selectedElement = element;
        exitSelectionMode();
        showExportDialog();
    }
    
    // 处理键盘事件
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            exitSelectionMode();
        }
    }
    
    // 显示导出对话框
    function showExportDialog() {
        // 创建背景遮罩
        const backdrop = document.createElement('div');
        backdrop.style.cssText = STYLES.dialogBackdrop;
        
        // 创建对话框
        exportDialog = document.createElement('div');
        exportDialog.style.cssText = STYLES.dialog;
        
        exportDialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">导出设置</h3>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 500;">最大宽度：</label>
                <select id="widthSelect" style="width: 100%; padding: 8px 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; background: white;">
                    <option value="800">800px</option>
                    <option value="1200" selected>1200px</option>
                    <option value="1920">1920px</option>
                    <option value="original">原始尺寸</option>
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
    
    // 执行导出
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
            createExportButton();
            createHighlightOverlay();
            console.log('HTML导出PNG工具已加载完成');
        }).catch(error => {
            console.error('加载html2canvas库失败:', error);
            alert('工具初始化失败，请检查网络连接');
        });
    }
    
    // 启动
    init();
})();
