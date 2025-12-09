# Markdown 查看器

一个简单美观的 Markdown 文件查看器，支持拖放文件并实时渲染。

## 功能特性

- 🎯 拖放上传：直接将 .md 文件拖放到页面即可查看
- 📝 完整渲染：支持标准 Markdown 语法和 GitHub Flavored Markdown
- 🎨 美观界面：现代化的 UI 设计，响应式布局
- ⚡ 即时预览：文件上传后立即显示渲染结果

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件
2. 将 Markdown 文件拖放到页面上的拖放区域
3. 或者点击拖放区域选择文件
4. 查看渲染后的 Markdown 内容

## 技术栈

- 纯 HTML/CSS/JavaScript
- [Marked.js](https://marked.js.org/) - Markdown 解析库（通过 CDN 加载）

## 浏览器支持

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）

## 本地开发

无需安装任何依赖，直接在浏览器中打开 `index.html` 即可使用。

如果需要本地服务器（推荐，避免某些浏览器的文件访问限制）：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (需要安装 http-server)
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000`
