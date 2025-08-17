# HTML导出PNG工具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-visit%20now-green.svg)](https://itshen.github.io/html2png/demo)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/itshen/html2png)
[![JavaScript](https://img.shields.io/badge/javascript-ES6%2B-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**🌟 演示地址：** [https://itshen.github.io/html2png/demo](https://itshen.github.io/html2png/demo)

一个**轻量级、零依赖**的JavaScript工具，可以让任何网页快速获得导出PNG图片的能力。

## ✨ 特点

- **🚀 轻量级** - 单文件解决方案，不超过几KB
- **📦 零依赖** - 不需要任何第三方库（自动加载html2canvas）
- **🎯 即用即走** - 一行代码引入，无需配置
- **🎨 透明背景** - 导出的图片默认透明背景
- **📱 响应式** - 支持多种导出尺寸选择

## 🚀 快速开始

### 1. 引入工具

在HTML页面底部添加以下代码：

```html
<script src="html-to-png-exporter.js"></script>
```

### 2. 开始使用

页面加载完成后，右下角会自动出现"导出"按钮，点击即可开始使用。

## 📋 使用步骤

1. **点击导出按钮** - 页面右下角的蓝色"导出"按钮
2. **选择元素** - 鼠标悬停在想要导出的内容上（会显示蓝色边框）
3. **确认选择** - 点击高亮的元素
4. **设置参数** - 在弹窗中选择图片最大宽度：
   - 800px
   - 1200px
   - 1920px
   - 原始尺寸
5. **导出下载** - 点击"导出PNG"按钮，图片自动下载

## 🎯 功能特性

### 智能选择
- 鼠标悬停实时高亮预览
- 精确元素边界识别
- 支持任意HTML元素选择

### 灵活导出
- 多种尺寸预设选项
- 高清2倍分辨率导出
- 透明背景处理
- 自动文件命名（时间戳）

### 用户体验
- 一键进入/退出选择模式
- ESC键快速取消操作
- 直观的视觉反馈
- 现代化UI设计

## 🔧 技术实现

- **纯JavaScript** - 使用原生ES6+语法
- **自动加载** - 动态引入html2canvas库
- **事件驱动** - 高效的事件监听机制
- **样式隔离** - 不影响页面原有样式

## 📁 文件说明

- `html-to-png-exporter.js` - 核心工具文件
- `demo.html` - 功能演示页面
- `README.md` - 使用说明文档

## 🌟 演示体验

打开 `demo.html` 文件在浏览器中查看完整的功能演示。

## ⚠️ 注意事项

1. **网络要求** - 首次使用需要联网加载html2canvas库
2. **跨域限制** - 导出包含跨域图片的元素时可能受限
3. **浏览器兼容** - 现代浏览器（Chrome、Firefox、Safari、Edge）

## 🤝 适用场景

- **设计展示** - 快速导出设计稿片段
- **bug反馈** - 导出问题页面元素
- **内容分享** - 将网页内容转为图片分享
- **文档截图** - 导出表格、图表等数据可视化内容
- **开发调试** - 快速保存页面状态

---

**开始使用这个强大而简单的工具，让您的网页拥有专业的导出功能！** 🎉

---

## 👋 关于作者

**嗨，我是洛小山**  
白天是个爱折腾的 AI 产品经理，晚上是个快乐的小开发~

### 🎯 关于这个工具

这是我根据公众号读者的需求开发的HTML导出PNG工具，让任何网页都能轻松导出精美的图片，希望能帮你省下宝贵的时间！

### 🚀 更多好玩的

我还在捣鼓更多有趣的 AI 小工具，会在公众号【**洛小山**】和大家分享：

- 各种实用的 AI 工具
- 有趣的技术教程  
- AI 技术到产品的实践
- AI 产品拆解

### 💡 期待你的想法

在日常工作或生活中，有没有觉得"要是有个 AI 工具能帮我做这个就好了"？欢迎扫码和我聊聊，说不定你的小需求就能变成下一个实用工具！

### 🐛 遇到问题？

开发不易，难免有 bug ~ 如果你发现了什么问题，欢迎来和我说说，我会及时修复的！你的反馈就是对我最好的支持 😊

### 🏠 联系方式

**洛小山：** [luoxiaoshan.cn](https://luoxiaoshan.cn)
