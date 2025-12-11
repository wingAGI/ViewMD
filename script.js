// 获取 DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const clearBtn = document.getElementById('clearBtn');
const clearBtnFullscreen = document.getElementById('clearBtnFullscreen');
const contentArea = document.getElementById('contentArea');
const markdownContent = document.getElementById('markdownContent');
const notification = document.getElementById('notification');

// 配置 marked 选项
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });
}

// 处理文件读取和渲染
function handleFile(file) {
    // 不再在这里检查文件扩展名，因为 handleFileWithCheck 已经处理了
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        // 渲染 Markdown
        if (typeof marked !== 'undefined') {
            markdownContent.innerHTML = marked.parse(content);
            // 为代码块添加复制按钮
            addCopyButtonsToCodeBlocks();
        } else {
            markdownContent.textContent = 'Failed to load Markdown parser library. Please refresh the page and try again.';
        }
        
        // 进入全屏模式：隐藏初始界面，显示内容区域
        document.querySelector('header').style.display = 'none';
        dropZone.style.display = 'none';
        fileInfo.style.display = 'none';
        contentArea.style.display = 'block';
        clearBtnFullscreen.style.display = 'block';
        document.body.classList.add('fullscreen-mode');
    };
    
    reader.onerror = function() {
            alert('Failed to read file. Please try again.');
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 拖放事件处理 - dropZone
dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    handleDrop(e);
});

// 拖放事件处理 - contentArea（全屏模式）
contentArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    contentArea.classList.add('drag-over');
});

contentArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // 只有当真正离开 contentArea 时才移除样式
    if (!contentArea.contains(e.relatedTarget)) {
        contentArea.classList.remove('drag-over');
    }
});

contentArea.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    contentArea.classList.remove('drag-over');
    handleDrop(e);
});

// 点击区域选择文件
dropZone.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// 从字符串 items 中提取文件名
async function extractFileNameFromStringItems(stringItems) {
    for (const item of stringItems) {
        try {
            const content = await new Promise((resolve) => {
                item.getAsString(resolve);
            });
            
            // 尝试从 URI 列表中提取文件路径
            const lines = content.split('\n').filter(line => line.trim());
            for (const line of lines) {
                const trimmedLine = line.trim();
                // 检查是否是文件路径（不以 http:// 或 https:// 开头）
                if (trimmedLine && !trimmedLine.startsWith('http://') && !trimmedLine.startsWith('https://')) {
                    // 提取文件名（支持 Unix 和 Windows 路径）
                    const fileName = trimmedLine.split('/').pop() || trimmedLine.split('\\').pop();
                    if (fileName) {
                        return fileName;
                    }
                }
            }
        } catch (err) {
            console.warn('无法获取字符串内容:', err);
        }
    }
    return null;
}

// 显示临时通知
function showTemporaryNotification(message, duration = 2000) {
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.display = 'block';
    notification.classList.remove('fade-out');
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, duration);
}

// 打开文件选择器（带降级处理）
function openFilePicker() {
    if (fileInput.showPicker) {
        // 现代浏览器：使用 showPicker API
        fileInput.showPicker().catch(err => {
            console.log('showPicker 失败，降级到点击:', err);
            // 降级：如果 showPicker 失败，触发点击
            fileInput.click();
        });
    } else {
        // 旧浏览器：直接点击
        fileInput.click();
    }
}

// 为代码块添加复制按钮
function addCopyButtonsToCodeBlocks() {
    const codeBlocks = markdownContent.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeElement) => {
        const preElement = codeElement.parentElement;
        
        // 避免重复添加按钮
        if (preElement.querySelector('.copy-code-btn')) {
            return;
        }
        
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.setAttribute('aria-label', '复制代码');
        copyButton.innerHTML = `
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        
        // 设置 pre 元素为相对定位，以便按钮可以绝对定位
        preElement.style.position = 'relative';
        
        // 添加点击事件
        copyButton.addEventListener('click', async function() {
            const codeText = codeElement.textContent || codeElement.innerText;
            
            try {
                await navigator.clipboard.writeText(codeText);
                // 显示成功状态
                copyButton.classList.add('copied');
                const copyIcon = copyButton.querySelector('.copy-icon');
                const checkIcon = copyButton.querySelector('.check-icon');
                if (copyIcon) copyIcon.style.display = 'none';
                if (checkIcon) checkIcon.style.display = 'block';
                
                // 显示通知
                showTemporaryNotification('代码已复制到剪贴板', 2000);
                
                // 2秒后恢复原状
                setTimeout(() => {
                    copyButton.classList.remove('copied');
                    if (copyIcon) copyIcon.style.display = 'block';
                    if (checkIcon) checkIcon.style.display = 'none';
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
                // 降级方案：使用传统方法
                const textArea = document.createElement('textarea');
                textArea.value = codeText;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showTemporaryNotification('代码已复制到剪贴板', 2000);
                } catch (fallbackErr) {
                    showTemporaryNotification('复制失败，请手动选择复制', 3000);
                }
                document.body.removeChild(textArea);
            }
        });
        
        // 将按钮添加到 pre 元素
        preElement.appendChild(copyButton);
    });
}

// 清除功能
function clearContent() {
    // 恢复初始界面
    document.querySelector('header').style.display = 'block';
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    contentArea.style.display = 'none';
    clearBtnFullscreen.style.display = 'none';
    markdownContent.innerHTML = '';
    fileInput.value = '';
    document.body.classList.remove('fullscreen-mode');
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 清除按钮（初始界面的）
clearBtn.addEventListener('click', clearContent);

// 清除按钮（全屏模式的）
clearBtnFullscreen.addEventListener('click', clearContent);

// 处理拖放事件（支持多种拖放源）
function handleDrop(e) {
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) {
        console.warn('dataTransfer 对象不存在');
        alert('dataTransfer object does not exist');
        return;
    }
    
    // 调试信息：记录拖放事件的详细信息
    console.log('拖放事件触发，调试信息:', {
        types: Array.from(dataTransfer.types || []),
        itemsLength: dataTransfer.items?.length || 0,
        filesLength: dataTransfer.files?.length || 0,
        effectAllowed: dataTransfer.effectAllowed,
        dropEffect: dataTransfer.dropEffect
    });

    // 首先检查是否是从编辑器拖放的（只有字符串类型的 items，没有文件）
    const hasStringItems = dataTransfer?.items && Array.from(dataTransfer.items).some(item => 
        item.kind === 'string'
    );
    const hasFileItems = dataTransfer?.items && Array.from(dataTransfer.items).some(item => 
        item.kind === 'file'
    );
    const hasFiles = dataTransfer?.files && dataTransfer.files.length > 0;
    
    // 如果只有字符串类型的 items，没有文件类型的 items 和 files，说明是从编辑器拖放的，直接忽略
    if (hasStringItems && !hasFileItems && !hasFiles) {
        console.log('检测到从编辑器拖放，忽略操作');
        return;
    }
    
    let fileFound = false;
    let file = null;
    
    // 优先使用 items API（支持从编辑器/IDE拖放）
    if (dataTransfer.items && dataTransfer.items.length > 0) {
        console.log('尝试使用 items API，items 数量:', dataTransfer.items.length);
        
        // 收集所有字符串类型的 items（用于处理 URI 列表）
        const stringItems = [];
        
        for (let i = 0; i < dataTransfer.items.length; i++) {
            const item = dataTransfer.items[i];
            console.log(`Item ${i}:`, {
                kind: item.kind,
                type: item.type
            });
            
            // 检查是否是文件类型
            if (item.kind === 'file') {
                try {
                    file = item.getAsFile();
                    console.log('从 item 获取文件:', file ? {
                        name: file.name,
                        size: file.size,
                        type: file.type
                    } : 'null');
                    // 检查文件对象是否有效
                    if (file && (file instanceof File || file instanceof Blob)) {
                        fileFound = true;
                        console.log('成功找到文件（通过 items API）');
                        break;
                    }
                } catch (err) {
                    console.warn('无法从 item 获取文件:', err);
                    // 继续尝试其他方法
                }
            }
            // 收集字符串类型的 items（可能是文件路径或 URI 列表）
            else if (item.kind === 'string') {
                const uriListTypes = [
                    'text/uri-list',
                    'text/plain',
                    'application/vnd.code.uri-list'
                ];
                
                if (uriListTypes.includes(item.type) || item.type.startsWith('text/')) {
                    stringItems.push(item);
                    console.log(`收集到字符串类型 item: ${item.type}`);
                }
            }
        }
        
        // 记录字符串类型的 items（用于后续调试）
        if (stringItems.length > 0) {
            console.log(`检测到 ${stringItems.length} 个字符串类型的 items，类型:`, 
                stringItems.map(item => item.type));
        }
    }
    
    // 回退到 files API（支持从文件管理器拖放）
    if (!fileFound && dataTransfer.files && dataTransfer.files.length > 0) {
        console.log('尝试使用 files API，files 数量:', dataTransfer.files.length);
        for (let i = 0; i < dataTransfer.files.length; i++) {
            const f = dataTransfer.files[i];
            console.log(`File ${i}:`, {
                name: f.name,
                size: f.size,
                type: f.type
            });
            // 检查文件对象是否有效
            if (f && (f instanceof File || f instanceof Blob)) {
                file = f;
                fileFound = true;
                console.log('成功找到文件（通过 files API）');
                break;
            }
        }
    }
    
    // 如果找到了文件，处理它
    if (fileFound && file) {
        handleFileWithCheck(file);
    } else {
        // 调试信息（生产环境也输出，方便排查问题）
        // 确保 dataTransfer 存在后再访问其属性
        const debugInfo = {
            dataTransferExists: !!dataTransfer,
            hasItems: !!dataTransfer?.items,
            itemsLength: dataTransfer?.items?.length ?? 0,
            hasFiles: !!dataTransfer?.files,
            filesLength: dataTransfer?.files?.length ?? 0,
            types: dataTransfer?.types ? Array.from(dataTransfer.types) : [],
            effectAllowed: dataTransfer?.effectAllowed ?? null,
            dropEffect: dataTransfer?.dropEffect ?? null,
            items: []
        };
        
        // 收集 items 的详细信息
        if (dataTransfer?.items && dataTransfer.items.length > 0) {
            for (let i = 0; i < dataTransfer.items.length; i++) {
                const item = dataTransfer.items[i];
                try {
                    debugInfo.items.push({
                        kind: item.kind ?? 'unknown',
                        type: item.type ?? 'unknown'
                    });
                } catch (err) {
                    debugInfo.items.push({
                        kind: 'error',
                        type: `Cannot access item ${i}: ${err.message}`
                    });
                }
            }
        }
        
        // 收集 files 的详细信息
        if (dataTransfer?.files && dataTransfer.files.length > 0) {
            debugInfo.files = [];
            for (let i = 0; i < dataTransfer.files.length; i++) {
                const f = dataTransfer.files[i];
                debugInfo.files.push({
                    name: f.name ?? 'unknown',
                    size: f.size ?? 0,
                    type: f.type ?? 'unknown'
                });
            }
        }
        
        console.warn('未找到文件，调试信息:', debugInfo);
        // 修复 alert：将对象转换为 JSON 字符串
        // alert('File not found. Debug info:\n' + JSON.stringify(debugInfo, null, 2));
        alert('Please drop a Markdown file (.md or .markdown)');
    }
}

// 处理文件并检查内容（如果文件名不符合要求，尝试读取内容判断）
function handleFileWithCheck(file) {
    // 验证文件对象
    if (!file || !(file instanceof File)) {
        console.warn('无效的文件对象:', file);
        alert('Please drop a Markdown file (.md or .markdown)');
        return;
    }
    
    const fileName = (file.name || '').toLowerCase();
    
    // 如果文件名明确是 Markdown 文件，直接处理
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
        handleFile(file);
        return;
    }
    
    // 如果文件名没有扩展名或不符合要求，尝试读取文件内容来判断
    // 这对于从编辑器（如 Cursor）拖放的文件很有用
    // 对于没有文件名或扩展名的文件，直接接受（可能是从编辑器拖放的）
    if (!fileName || fileName === '' || !fileName.includes('.')) {
        // 直接接受没有扩展名的文件（通常是从编辑器拖放的）
        handleFile(file);
        return;
    }
    
    // 如果有扩展名但不是 .md/.markdown，尝试读取内容判断
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        // 检查内容是否看起来像 Markdown
        // 检查常见的 Markdown 语法：标题、列表、代码块、链接等
        const markdownPatterns = [
            /^[\s]*#{1,6}\s+/,           // 标题
            /^[\s]*[-*+]\s+/,            // 无序列表
            /^[\s]*\d+\.\s+/,            // 有序列表
            /^[\s]*```/,                 // 代码块
            /^[\s]*>/ ,                  // 引用
            /\[.*\]\(.*\)/,              // 链接
            /`[^`]+`/,                   // 行内代码
            /^\s*\|.*\|/,                // 表格
        ];
        
        const sampleContent = content.substring(0, Math.min(500, content.length));
        const isMarkdown = markdownPatterns.some(pattern => pattern.test(sampleContent));
        
        // 如果内容看起来像 Markdown，就接受它
        if (isMarkdown) {
            handleFile(file);
        } else {
            alert('Please drop a Markdown file (.md or .markdown)');
        }
    };
    
    reader.onerror = function() {
        // 如果读取失败，但文件名没有扩展名，仍然尝试处理（可能是从编辑器拖放的）
        if (!fileName || fileName === '' || !fileName.includes('.')) {
            handleFile(file);
        } else {
            alert('Failed to read file. Please try again.');
        }
    };
    
    // 读取前 500 个字符来判断（增加读取量以提高准确性）
    // 如果文件小于 500 字节，读取整个文件
    const readLength = Math.min(500, file.size);
    const blob = file.slice(0, readLength);
    reader.readAsText(blob, 'UTF-8');
}

// 全局拖放事件处理 - 允许在整个页面上拖放文件
// 只在目标不是 dropZone 或 contentArea 时才处理，避免干扰正常的拖放区域
document.addEventListener('dragover', function(e) {
    const target = e.target;
    const isDropZone = dropZone.contains(target);
    const isContentArea = contentArea.contains(target);
    
    // 如果已经在 dropZone 或 contentArea 上，让它们自己处理
    if (isDropZone || isContentArea) {
        return;
    }
    
    // 检查是否有文件被拖放
    if (e.dataTransfer && e.dataTransfer.types) {
        const types = Array.from(e.dataTransfer.types);
        const hasFiles = types.some(type => 
            type === 'Files' || 
            type === 'application/x-moz-file' ||
            type === 'text/plain' || // 某些编辑器可能使用这个类型
            type.startsWith('application/')
        );
        if (hasFiles) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}, false);

document.addEventListener('drop', function(e) {
    // 检查是否有文件被拖放
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) {
        return;
    }
    
    // 检查是否有文件
    const hasFiles = (dataTransfer.files && dataTransfer.files.length > 0) || 
                  (dataTransfer.items && dataTransfer.items.length > 0);
    
    if (hasFiles) {
        // 如果事件目标不是 dropZone 或 contentArea，则处理它
        const target = e.target;
        const isDropZone = dropZone.contains(target);
        const isContentArea = contentArea.contains(target);
        
        if (!isDropZone && !isContentArea) {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e);
        }
    }
}, false);
