# Resume Builder

一个基于 Next.js 的在线简历编辑与导出工具，支持模块化编辑、Markdown / 富文本双模式内容输入，以及基于 Puppeteer 的页面转 PDF 导出。

## 功能

- 模块化简历编辑，支持拖拽排序
- 个人信息、头像、模块内容的可视化维护
- 模块内容支持 `Markdown` 和 `富文本` 两种模式切换
- 预览与导出共用同一份 HTML 模板，降低样式漂移
- 使用 `puppeteer-core + @sparticuz/chromium` 生成 PDF，适配 Vercel 部署
- 支持导入 / 导出 `.magicyan` 简历数据文件

## 技术栈

- Next.js 15
- React 19
- Tailwind CSS 4
- shadcn/ui
- Iconify
- Puppeteer Core
- @sparticuz/chromium
- @uiw/react-md-editor

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

默认访问地址：

```text
http://localhost:3000
```

生产构建：

```bash
pnpm build
pnpm start
```

## PDF 导出说明

项目当前不再使用 `react-pdf`。

PDF 导出流程为：

1. 将当前简历数据渲染为统一的 HTML 模板
2. 调用 `/api/export/pdf`
3. 在服务端使用 Puppeteer 打开 HTML 并导出 A4 PDF

在 Vercel 环境下，导出依赖：

- `puppeteer-core`
- `@sparticuz/chromium`

本地开发环境下需要系统中存在可用的 Chrome / Chromium。

## 数据格式

简历数据使用 `.magicyan` 文件保存，本质是 JSON。

示例结构：

```ts
interface MagicyanFile {
  version: string
  data: ResumeData
  metadata: {
    exportedAt: string
    appVersion: string
  }
}

interface ResumeData {
  title: string
  personalInfo: PersonalInfoItem[]
  modules: ResumeModule[]
  avatar?: string
  createdAt: string
  updatedAt: string
}
```

## 项目结构

```text
app/
  globals.css
  layout.tsx
  page.tsx
  pdf-preview/page.tsx

components/
  html-resume-preview.tsx
  module-editor.tsx
  pdf-export-button.tsx
  personal-info-editor.tsx
  resume-builder.tsx
  rich-text-editor.tsx
  ui/

lib/
  export-html.ts
  markdown.ts
  pdf-client.ts
  resume-content.ts
  resume-utils.ts

pages/
  api/export/pdf.ts

public/
  demo.magicyan

types/
  resume.ts
```

## 开源协议

本项目基于 `GNU Affero General Public License v3.0` 开源，详见 [LICENSE](./LICENSE)。
