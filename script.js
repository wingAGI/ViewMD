// 确保 DOM 已加载
(function() {
    'use strict';
    
    // 检查 marked 库是否已加载
    if (typeof marked === 'undefined') {
        console.error('Marked library is not available');
        document.body.insertAdjacentHTML('beforeend', 
            '<div style="position:fixed;top:0;left:0;right:0;background:#ff6b6b;color:white;padding:10px;text-align:center;z-index:9999;">' +
            'Markdown 解析库加载失败，请刷新页面重试。</div>');
        return;
    }
    
    // 获取 DOM 元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const clearBtn = document.getElementById('clearBtn');
    const contentArea = document.getElementById('contentArea');
    const markdownContent = document.getElementById('markdownContent');
    
    // 检查必要的 DOM 元素是否存在
    if (!dropZone || !fileInput || !fileInfo || !fileName || !clearBtn || !contentArea || !markdownContent) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // 配置 marked 选项
    try {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });
        console.log('Marked library initialized successfully');
    } catch (error) {
        console.error('Error configuring marked:', error);
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
        try {
            if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
                markdownContent.innerHTML = marked.parse(content);
            } else {
                markdownContent.innerHTML = '<div style="color:#ff6b6b;padding:20px;text-align:center;">' +
                    'Markdown 解析库加载失败，请刷新页面重试。</div>';
                console.error('Marked.parse is not available');
            }
        } catch (error) {
            console.error('Error parsing markdown:', error);
            markdownContent.innerHTML = '<div style="color:#ff6b6b;padding:20px;text-align:center;">' +
                '渲染 Markdown 时出错：' + error.message + '</div>';
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
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

// 防止页面默认的拖放行为
document.addEventListener('dragover', function(e) {
    e.preventDefault();
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
});

})(); // 立即执行函数结束
