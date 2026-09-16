# CV · 雷璎琪个人求职网站

一套无需安装依赖即可运行的响应式个人网站，已按页面、样式、脚本与素材分层组织。

## 项目结构

```text
leileizi/
├─ src/
│  ├─ pages/
│  │  └─ index.html          # 网站首页
│  ├─ styles/
│  │  ├─ app.css             # 样式统一入口
│  │  ├─ base.css            # 变量、重置与公共样式
│  │  ├─ sections.css        # 页面各版块样式
│  │  └─ responsive.css      # 平板、手机与打印适配
│  ├─ scripts/
│  │  └─ main.js             # 导航、动画和复制交互
│  └─ assets/
│     └─ images/             # 个人照片及其他图片素材
└─ previews/                 # 桌面端与手机端预览图
```

## 预览

直接打开项目根目录的 `index.html`，或使用任意静态文件服务器打开项目根目录。

## 在线发布

网站地址：https://lanausee-leiyingqi.github.io/CV/

项目根目录已配置 GitHub Pages 入口。将仓库推送到 GitHub 后，在仓库的
`Settings → Pages` 中选择从 `main` 分支、根目录 `/ (root)` 发布即可。

## 替换个人照片

1. 将新照片替换到 `src/assets/images/image.jpg`。
2. 如果照片尺寸有变化，更新 `src/pages/index.html` 中照片的 `width` 和 `height` 属性为实际像素尺寸。

建议照片使用 3:4 竖版构图，人物居中，背景尽量简洁。
