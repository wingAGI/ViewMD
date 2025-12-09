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
    let fileFound = false;
    
    // 优先使用 items API（支持从编辑器/IDE拖放）
    if (dataTransfer.items && dataTransfer.items.length > 0) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
            const item = dataTransfer.items[i];
            
            // 检查是否是文件类型
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    fileFound = true;
                    // 对于从编辑器拖放的文件，更宽松地接受
                    handleFileWithCheck(file);
                    return;
                }
            }
        }
    }
    
    // 回退到 files API（支持从文件管理器拖放）
    if (dataTransfer.files && dataTransfer.files.length > 0) {
        for (let i = 0; i < dataTransfer.files.length; i++) {
            const file = dataTransfer.files[i];
            if (file) {
                fileFound = true;
                handleFileWithCheck(file);
                return;
            }
        }
    }
    
    if (!fileFound) {
        alert('请拖放 Markdown 文件 (.md 或 .markdown)');
    }
}

// 处理文件并检查内容（如果文件名不符合要求，尝试读取内容判断）
function handleFileWithCheck(file) {
    const fileName = (file.name || '').toLowerCase();
    
    // 如果文件名明确是 Markdown 文件，直接处理
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
        handleFile(file);
        return;
    }
    
    // 如果文件名没有扩展名或不符合要求，尝试读取文件内容来判断
    // 这对于从编辑器（如 Cursor）拖放的文件很有用
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
        
        // 如果没有扩展名，或者内容看起来像 Markdown，就接受它
        // 对于从编辑器拖放的文件，通常没有扩展名，我们更宽松地接受
        if (fileName === '' || !fileName.includes('.') || isMarkdown) {
            handleFile(file);
        } else {
            alert('请拖放 Markdown 文件 (.md 或 .markdown)');
        }
    };
    
    reader.onerror = function() {
        // 如果读取失败，但文件名没有扩展名，仍然尝试处理（可能是从编辑器拖放的）
        if (fileName === '' || !fileName.includes('.')) {
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
// 使用捕获阶段，确保能捕获到所有拖放事件
document.addEventListener('dragover', function(e) {
    // 检查是否有文件被拖放
    if (e.dataTransfer && e.dataTransfer.types) {
        const hasFiles = Array.from(e.dataTransfer.types).some(type => 
            type === 'Files' || 
            type === 'application/x-moz-file' ||
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
    if (dataTransfer && (dataTransfer.files.length > 0 || (dataTransfer.items && dataTransfer.items.length > 0))) {
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
