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

### 方法一：使用 npm 脚本（推荐，最简单）

```bash
# 安装依赖（首次运行）
npm install

# 启动本地开发服务器（会自动打开浏览器）
npm run dev
# 或
npm start
```

服务器会在 `http://localhost:8000` 启动，并自动打开浏览器。

### 方法二：直接打开（简单但不推荐）

无需安装任何依赖，直接在浏览器中打开 `index.html` 即可使用。

**注意：** 某些浏览器（如 Chrome）可能因为安全策略限制本地文件访问，拖放功能可能无法正常工作。如果遇到问题，请使用方法一。

### 方法三：使用其他本地服务器

如果不想使用 npm，也可以使用其他工具：

```bash
# 使用 Python（Python 3）
python -m http.server 8000

# 或使用 Python 2
python -m SimpleHTTPServer 8000

# 使用 Node.js (无需安装，直接运行)
npx http-server -p 8000 -o

# 使用 PHP
php -S localhost:8000

# 使用 Ruby
ruby -run -e httpd . -p 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 调试技巧

1. **打开浏览器开发者工具**
   - 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
   - 查看 Console 标签页的错误信息
   - 查看 Network 标签页，确保资源文件（CSS、JS）正确加载

2. **测试拖放功能**
   - 确保文件扩展名为 `.md` 或 `.markdown`
   - 从文件管理器（访达/Finder）拖放文件
   - 从编辑器（如 Cursor）导航栏拖放文件
   - 如果拖放不工作，检查浏览器控制台是否有错误

3. **常见问题排查**
   - 如果拖放不工作：确保使用本地服务器（方法一或方法三），不要直接打开 `file://` 协议的文件
   - 如果样式异常：检查 `styles.css` 是否正确加载
   - 如果 Markdown 不渲染：检查 `marked.js` CDN 是否可访问，或查看控制台错误

## 部署指南

这是一个纯静态网站，可以轻松部署到多个平台。以下推荐几个支持自定义域名、适合商业化的部署平台：

### 🚀 Vercel（推荐）

**优点：**
- ✅ 免费套餐充足，适合商业化
- ✅ 自动 HTTPS 和全球 CDN
- ✅ 免费自定义域名
- ✅ Git 推送自动部署
- ✅ 部署速度快，界面友好

**部署步骤：**

1. **通过 GitHub 部署（推荐）：**
   ```bash
   # 1. 将代码推送到 GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   
   # 2. 访问 https://vercel.com
   # 3. 使用 GitHub 账号登录
   # 4. 点击 "New Project"
   # 5. 导入你的 GitHub 仓库
   # 6. 点击 "Deploy"（无需修改任何配置）
   ```

2. **通过 Vercel CLI 部署：**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 部署
   vercel
   
   # 生产环境部署
   vercel --prod
   ```

3. **配置自定义域名：**
   - 在 Vercel 项目设置中找到 "Domains"
   - 添加你的域名（如：markdown-viewer.com）
   - 按照提示配置 DNS 记录（添加 CNAME 记录）
   - 等待 SSL 证书自动配置（通常几分钟）

**重要提示：**
- ✅ 确保所有资源路径使用相对路径（如 `./styles.css` 而不是 `/styles.css`）
- ✅ `package.json` 中不要包含 `start` 或 `build` 脚本，避免 Vercel 误判为 Node.js 项目
- ✅ 项目已配置为纯静态网站，无需构建步骤

### 🌐 Netlify

**优点：**
- ✅ 免费套餐，支持自定义域名
- ✅ 拖拽部署或 Git 集成
- ✅ 表单处理、身份验证等额外功能

**部署步骤：**

1. **拖拽部署（最简单）：**
   - 访问 https://app.netlify.com
   - 登录后，直接将项目文件夹拖到页面
   - 部署完成！

2. **通过 Git 部署：**
   - 连接 GitHub/GitLab/Bitbucket 仓库
   - 自动部署，配置已包含在 `netlify.toml` 中

3. **配置自定义域名：**
   - 在站点设置中找到 "Domain management"
   - 添加自定义域名
   - 配置 DNS 记录

### ☁️ Cloudflare Pages

**优点：**
- ✅ 完全免费，无流量限制
- ✅ 全球 CDN，速度快
- ✅ 与 Cloudflare 生态集成

**部署步骤：**

1. 访问 https://pages.cloudflare.com
2. 连接 Git 仓库
3. 构建配置：构建命令留空，输出目录填 `.`
4. 部署并配置自定义域名

### 📦 GitHub Pages

**优点：**
- ✅ 完全免费
- ✅ 与 GitHub 深度集成

**部署步骤：**

```bash
# 1. 在 GitHub 仓库设置中启用 GitHub Pages
# Settings > Pages > Source: main branch

# 2. 访问 https://yourusername.github.io/markdown-viewer
```

**自定义域名：**
- 在仓库根目录创建 `CNAME` 文件，内容为你的域名
- 在域名 DNS 中添加 CNAME 记录指向 `yourusername.github.io`

### 🇨🇳 国内平台推荐

**阿里云 OSS + CDN**
- 适合主要面向国内用户
- 访问速度快，商业化成熟
- 需要购买 OSS 存储和 CDN 流量

**腾讯云 COS + CDN**
- 类似阿里云，国内访问速度快
- 有免费额度

## 商业化建议

1. **域名选择：**
   - 选择一个简短、易记的域名
   - 建议使用 `.com` 或 `.io` 后缀
   - 可在 Namecheap、GoDaddy、阿里云等平台购买

2. **SSL 证书：**
   - 所有推荐平台都自动提供免费 SSL 证书
   - 确保网站使用 HTTPS（对 SEO 和用户信任很重要）

3. **性能优化：**
   - 所有平台都提供 CDN，全球访问速度快
   - 考虑添加 Google Analytics 等分析工具

4. **SEO 优化：**
   - 在 `index.html` 中添加 meta 标签
   - 考虑添加 sitemap.xml

## 推荐部署方案

**最佳选择：Vercel**
- 部署最简单，功能最完善
- 免费套餐足够个人和小型项目使用
- 商业化友好，可以无缝升级到付费计划

**备选方案：**
- 国内用户：阿里云 OSS + CDN
- 预算有限：Cloudflare Pages（完全免费）
