# 编辑器拖放自动打开文件选择器方案

## 需求
当用户从编辑器（如 Cursor/VSCode）拖放文件到浏览器时，自动打开文件选择器，并尽可能定位到用户拖动的文件。

## 方案对比

### 方案一：使用 `showPicker()` API（推荐 ⭐）

**优点：**
- ✅ 现代浏览器原生支持（Chrome 102+, Edge 102+, Safari 15.2+）
- ✅ 可以程序化打开文件选择器
- ✅ 实现简单，用户体验好
- ✅ 不需要额外权限

**缺点：**
- ❌ 无法自动定位到特定文件（浏览器安全限制）
- ❌ 需要用户手动选择文件
- ❌ 旧浏览器不支持（但可以降级处理）

**实现思路：**
```javascript
// 检测到编辑器拖放时
if (hasStringItems && !hasFileItems) {
    // 尝试从字符串中提取文件名
    const fileName = extractFileNameFromStringItems(stringItems);
    
    // 显示友好的提示
    const userConfirm = confirm(
        `检测到您拖放了文件：${fileName}\n\n` +
        `由于浏览器安全限制，需要您手动选择文件。\n\n` +
        `是否现在打开文件选择器？`
    );
    
    if (userConfirm) {
        // 打开文件选择器
        fileInput.showPicker();
    }
}
```

**浏览器支持：**
- Chrome 102+ ✅
- Edge 102+ ✅
- Safari 15.2+ ✅
- Firefox 不支持（但可以降级到点击 input）

---

### 方案二：使用 File System Access API（高级方案）

**优点：**
- ✅ 可以访问文件系统
- ✅ 可以读取文件内容
- ✅ 用户体验最好（如果支持）

**缺点：**
- ❌ 需要用户授权（每次都需要）
- ❌ 浏览器支持有限（Chrome/Edge 86+，Safari 不支持）
- ❌ 无法自动定位到文件（只能打开目录选择器）
- ❌ 实现复杂

**实现思路：**
```javascript
async function handleEditorDrop(filePath) {
    try {
        // 请求文件系统访问权限
        const fileHandle = await window.showOpenFilePicker({
            suggestedName: extractFileName(filePath),
            types: [{
                description: 'Markdown files',
                accept: { 'text/markdown': ['.md', '.markdown'] }
            }]
        });
        
        const file = await fileHandle[0].getFile();
        handleFile(file);
    } catch (err) {
        // 用户取消或浏览器不支持
        console.log('文件选择取消或不支持');
    }
}
```

**浏览器支持：**
- Chrome 86+ ✅
- Edge 86+ ✅
- Firefox 不支持 ❌
- Safari 不支持 ❌

---

### 方案三：智能提示 + 自动打开文件选择器（最佳用户体验 ⭐⭐⭐）

**优点：**
- ✅ 结合方案一，自动打开文件选择器
- ✅ 从拖放的字符串中提取文件名，给用户提示
- ✅ 兼容性好（降级处理）
- ✅ 用户体验最佳

**缺点：**
- ❌ 仍然需要用户手动选择文件（浏览器安全限制）
- ❌ 无法自动定位到文件

**实现思路：**
```javascript
// 1. 检测到编辑器拖放
if (hasStringItems && !hasFileItems) {
    // 2. 异步获取字符串内容，提取文件名
    const fileName = await extractFileNameFromStringItems(stringItems);
    
    // 3. 显示友好的提示（可选，或直接打开）
    if (fileName) {
        // 显示提示：检测到文件 xxx.md，正在打开文件选择器...
        showNotification(`检测到文件：${fileName}，正在打开文件选择器...`);
    }
    
    // 4. 延迟一点后自动打开文件选择器（让用户看到提示）
    setTimeout(() => {
        if (fileInput.showPicker) {
            fileInput.showPicker().catch(() => {
                // 降级：如果 showPicker 失败，触发点击
                fileInput.click();
            });
        } else {
            // 降级：旧浏览器直接点击
            fileInput.click();
        }
    }, 300);
}
```

**完整实现代码：**
```javascript
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
                // 检查是否是文件路径（不以 http:// 开头）
                if (trimmedLine && !trimmedLine.startsWith('http://') && !trimmedLine.startsWith('https://')) {
                    // 提取文件名
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

// 处理编辑器拖放
async function handleEditorDrop(stringItems) {
    const fileName = await extractFileNameFromStringItems(stringItems);
    
    // 显示通知（可选）
    if (fileName) {
        showTemporaryNotification(`检测到文件：${fileName}，正在打开文件选择器...`);
    }
    
    // 延迟后打开文件选择器
    setTimeout(() => {
        openFilePicker();
    }, 300);
}

// 打开文件选择器（带降级处理）
function openFilePicker() {
    if (fileInput.showPicker) {
        // 现代浏览器：使用 showPicker API
        fileInput.showPicker().catch(err => {
            console.log('showPicker 失败，降级到点击:', err);
            fileInput.click();
        });
    } else {
        // 旧浏览器：直接点击
        fileInput.click();
    }
}
```

---

### 方案四：使用 Electron/桌面应用（终极方案）

**如果这是一个桌面应用：**
- ✅ 可以完全访问文件系统
- ✅ 可以自动定位文件
- ✅ 不受浏览器安全限制

**缺点：**
- ❌ 需要将网页打包成桌面应用
- ❌ 增加开发和维护成本

---

## 推荐实现方案

**推荐使用方案三**：智能提示 + 自动打开文件选择器

**实现步骤：**
1. 检测到编辑器拖放（只有字符串类型的 items）
2. 异步提取文件名（从 URI 列表中）
3. 显示友好提示（可选）
4. 自动打开文件选择器（使用 `showPicker()` 或降级到 `click()`）
5. 用户选择文件后正常处理

**用户体验流程：**
```
用户从编辑器拖放文件
    ↓
检测到字符串类型的拖放
    ↓
提取文件名（如：README.md）
    ↓
显示提示："检测到文件：README.md，正在打开文件选择器..."
    ↓
自动打开文件选择器
    ↓
用户选择文件（浏览器会记住上次打开的目录）
    ↓
正常处理文件
```

**注意事项：**
- 无法自动定位到文件（浏览器安全限制）
- 但文件选择器会记住用户上次打开的目录，通常就是项目目录
- 可以提示用户文件名，方便快速找到

---

## 实现优先级

1. **立即实现**：方案三（智能提示 + 自动打开文件选择器）
2. **未来考虑**：方案二（File System Access API，如果浏览器支持度提高）
3. **不推荐**：方案四（除非确实需要桌面应用）
