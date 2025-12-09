// 获取 DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const clearBtn = document.getElementById('clearBtn');
const clearBtnFullscreen = document.getElementById('clearBtnFullscreen');
const contentArea = document.getElementById('contentArea');
const markdownContent = document.getElementById('markdownContent');

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
        } else {
            markdownContent.textContent = 'Markdown 解析库加载失败，请刷新页面重试。';
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
        alert('读取文件失败，请重试。');
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
        alert('dataTransfer 对象不存在');
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
        // 检查是否只有字符串类型的 items（可能是从编辑器拖放的）
        const hasStringItems = dataTransfer?.items && Array.from(dataTransfer.items).some(item => 
            item.kind === 'string'
        );
        const hasFileItems = dataTransfer?.items && Array.from(dataTransfer.items).some(item => 
            item.kind === 'file'
        );
        
        // 如果只有字符串类型的 items，说明可能是从编辑器拖放的
        if (hasStringItems && !hasFileItems && (!dataTransfer?.files || dataTransfer.files.length === 0)) {
            console.log('检测到从编辑器拖放，但无法直接读取文件');
            // 提示用户使用文件选择器
            alert('检测到您从编辑器拖放了文件。\n\n由于浏览器安全限制，无法直接从编辑器拖放中读取文件。\n\n请使用以下方法之一：\n1. 点击页面选择文件\n2. 从文件管理器（Finder/资源管理器）拖放文件');
            return;
        }
        
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
                        type: `无法访问 item ${i}: ${err.message}`
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
        alert('未找到文件，调试信息:\n' + JSON.stringify(debugInfo, null, 2));
        alert('请拖放 Markdown 文件 (.md 或 .markdown)');
    }
}

// 处理文件并检查内容（如果文件名不符合要求，尝试读取内容判断）
function handleFileWithCheck(file) {
    // 验证文件对象
    if (!file || !(file instanceof File)) {
        console.warn('无效的文件对象:', file);
        alert('请拖放 Markdown 文件 (.md 或 .markdown)');
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
            alert('请拖放 Markdown 文件 (.md 或 .markdown)');
        }
    };
    
    reader.onerror = function() {
        // 如果读取失败，但文件名没有扩展名，仍然尝试处理（可能是从编辑器拖放的）
        if (!fileName || fileName === '' || !fileName.includes('.')) {
            handleFile(file);
        } else {
            alert('读取文件失败，请重试。');
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
