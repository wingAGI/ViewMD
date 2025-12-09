// 获取 DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const clearBtn = document.getElementById('clearBtn');
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
    if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.markdown')) {
        alert('请选择 Markdown 文件 (.md 或 .markdown)');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        
        // 显示文件信息
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
        
        // 渲染 Markdown
        if (typeof marked !== 'undefined') {
            markdownContent.innerHTML = marked.parse(content);
        } else {
            markdownContent.textContent = 'Markdown 解析库加载失败，请刷新页面重试。';
        }
        
        // 显示内容区域
        contentArea.style.display = 'block';
        
        // 滚动到内容区域
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    reader.onerror = function() {
        alert('读取文件失败，请重试。');
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 拖放事件处理
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

// 清除按钮
clearBtn.addEventListener('click', function() {
    fileInfo.style.display = 'none';
    contentArea.style.display = 'none';
    markdownContent.innerHTML = '';
    fileInput.value = '';
});

// 处理拖放事件（支持多种拖放源）
function handleDrop(e) {
    const dataTransfer = e.dataTransfer;
    
    // 优先使用 items API（支持从编辑器/IDE拖放）
    if (dataTransfer.items && dataTransfer.items.length > 0) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
            const item = dataTransfer.items[i];
            
            // 检查是否是文件类型
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file && (file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown'))) {
                    handleFile(file);
                    return;
                }
            }
        }
    }
    
    // 回退到 files API（支持从文件管理器拖放）
    if (dataTransfer.files && dataTransfer.files.length > 0) {
        for (let i = 0; i < dataTransfer.files.length; i++) {
            const file = dataTransfer.files[i];
            if (file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown')) {
                handleFile(file);
                return;
            }
        }
    }
    
    alert('请拖放 Markdown 文件 (.md 或 .markdown)');
}

// 防止页面默认的拖放行为，但允许在 dropZone 上处理
document.addEventListener('dragover', function(e) {
    // 如果不在 dropZone 上，才阻止默认行为
    if (!dropZone.contains(e.target)) {
        e.preventDefault();
    }
});

document.addEventListener('drop', function(e) {
    // 如果不在 dropZone 上，阻止默认行为
    if (!dropZone.contains(e.target)) {
        e.preventDefault();
    } else {
        // 如果在 dropZone 上，让 dropZone 的事件处理器处理
        e.preventDefault();
        handleDrop(e);
    }
});
