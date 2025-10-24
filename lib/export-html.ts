import { renderMarkdown } from "./markdown";
import type { ResumeData } from "@/types/resume";

/**
 * 生成简历的完整 HTML 内容，用于 PDF 导出
 * @param resumeData 简历数据
 * @returns 完整的 HTML 字符串
 */
export function buildResumeHtml(resumeData: ResumeData): string {
  const style = `
    <style>
      @font-face {
        font-family: 'NotoSansSC-Medium';
        src: url('/NotoSansSC-Medium.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'NotoSansSC-Medium', 'Microsoft YaHei', 'SimSun', 'Arial', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: oklch(0.35 0.01 258.34);
        background: white;
        padding: 32px; /* p-8 from resume-preview */
      }
      
      .resume-preview {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 0; /* padding moved to body */
      }
      
      .resume-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      
      .header-content {
        flex: 1;
      }
      
      .resume-title {
        font-size: 24px;
        font-weight: bold;
        color: oklch(0.35 0.01 258.34);
        margin-bottom: 16px;
      }
      
      .personal-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 24px;
      }
      
      .personal-info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      
      .personal-info-label {
        color: oklch(0.35 0.01 258.34);
        font-size: 14px;
      }
      
      .personal-info-value {
        color: oklch(0.35 0.01 258.34);
        font-size: 14px;
      }
      
      .resume-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        transform: translateY(-1px);
      }
      
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid oklch(0.9 0 0);
        margin-left: 24px;
      }
      
      .resume-module {
        margin-bottom: 24px;
        page-break-inside: avoid;
      }
      
      .module-title {
        font-size: 18px;
        font-weight: 600;
        color: oklch(0.35 0.01 258.34);
        border-bottom: 1px solid oklch(0.9 0 0);
        padding-bottom: 8px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .module-subtitle {
        font-size: 14px;
        color: oklch(0.35 0.01 258.34);
        font-weight: 500;
        margin-left: 8px;
      }
      
      .module-time {
        font-size: 14px;
        color: oklch(0.35 0.01 258.34);
        font-style: italic;
      }
      
      .module-content {
        margin-top: 8px;
        font-size: 14px;
        line-height: 1.7;
        color: oklch(0.35 0.01 258.34);
      }
      
      /* Markdown 样式 */
      .module-content h1,
      .module-content h2,
      .module-content h3,
      .module-content h4,
      .module-content h5,
      .module-content h6 {
        margin: 16px 0 8px 0;
        color: oklch(0.35 0.01 258.34);
        font-weight: 600;
      }
      
      .module-content h1 { font-size: 20px; }
      .module-content h2 { font-size: 18px; }
      .module-content h3 { font-size: 15px; }
      .module-content h4 { font-size: 15px; }
      .module-content h5 { font-size: 14px; }
      .module-content h6 { font-size: 13px; }
      
      .module-content ul,
      .module-content ol {
        margin: 8px 0;
        padding-left: 20px;
      }
      
      .module-content li {
        margin: 4px 0;
      }
      
      .module-content p {
        margin: 8px 0;
      }
      
      .module-content strong {
        font-weight: 600;
        color: oklch(0.35 0.01 258.34);
      }
      
      .module-content em {
        font-style: italic;
        color: oklch(0.35 0.01 258.34);
      }
      
      .module-content code {
        background: oklch(0.97 0.01 258.34);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
        font-size: 13px;
        color: oklch(0.5 0.22 12.17);
      }
      
      .module-content pre {
        background: oklch(0.97 0.01 258.34);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 12px 0;
        border: 1px solid oklch(0.9 0 0);
      }
      
      .module-content pre code {
        background: none;
        padding: 0;
        color: oklch(0.35 0.01 258.34);
      }
      
      .module-content blockquote {
        border-left: 4px solid oklch(0.9 0 0);
        padding-left: 16px;
        margin: 12px 0;
        color: oklch(0.35 0.01 258.34);
        font-style: italic;
      }
      
      .module-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        border: 1px solid oklch(0.9 0 0);
      }
      
      .module-content th,
      .module-content td {
        border: 1px solid oklch(0.9 0 0);
        padding: 8px 12px;
        text-align: left;
      }
      
      .module-content th {
        background: oklch(0.98 0.01 258.34);
        font-weight: 600;
        color: oklch(0.35 0.01 258.34);
      }
      
      .module-content a {
        color: oklch(0.45 0.15 162.4);
        text-decoration: none;
      }
      
      .module-content a:hover {
        text-decoration: underline;
      }
      
      /* 额外的布局类 */
      .space-y-6 > * + * {
        margin-top: 24px;
      }
      
      .space-y-2 > * + * {
        margin-top: 8px;
      }
      
      .flex {
        display: flex;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-between {
        justify-content: space-between;
      }
      
      .font-medium {
        font-weight: 500;
      }
      
      .font-medium.text-foreground {
        font-size: 14px;
        font-weight: 500;
      }
      
      .text-foreground {
        color: oklch(0.35 0.01 258.34);
      }
      
      @media print {
        body {
          padding: 20px;
          font-size: 11pt;
          line-height: 1.3;
          color: oklch(0.35 0.01 258.34); /* Keep original color */
        }
        
        .resume-preview {
          box-shadow: none;
          padding: 0;
        }
        
        .resume-module {
          page-break-inside: avoid;
          margin-bottom: 12pt;
        }
        
        .module-content {
          font-size: 10pt;
        }
        
        .resume-title {
          font-size: 16pt;
          margin-bottom: 10pt;
          color: oklch(0.35 0.01 258.34); /* Keep original color */
        }
        
        .module-title {
          font-size: 13pt;
          margin-bottom: 6pt;
          margin-top: 8pt;
          border-bottom: 1pt solid oklch(0.9 0 0); /* Keep original border color */
          padding-bottom: 3pt;
          color: oklch(0.35 0.01 258.34); /* Keep original color */
        }
        
        .personal-info-item {
          font-size: 10pt;
          margin-right: 15pt;
          margin-bottom: 3pt;
        }
        
        .resume-icon {
          width: 10pt;
          height: 10pt;
          margin-right: 3pt;
        }
        
        .avatar {
          width: 50pt;
          height: 50pt;
          border: 1pt solid oklch(0.9 0 0); /* Keep original border color */
        }
      }
    </style>
  `;

  // 渲染个人信息
  const personalInfoHtml = resumeData.personalInfo
    .map((item) => {
      const iconHtml = item.icon 
        ? `<svg class="resume-icon" width="16" height="16" viewBox="0 0 24 24" fill="black">${item.icon}</svg>`
        : '';
      return `
        <div class="personal-info-item">
          ${iconHtml}
          <span class="personal-info-label">${item.label}:</span>
          <span class="personal-info-value">${item.value || "未填写"}</span>
        </div>
      `;
    })
    .join("");

  // 渲染模块内容
  const modulesHtml = resumeData.modules
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const iconHtml = module.icon 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="black">${module.icon}</svg>`
        : '';
      
      return `
        <div class="resume-module">
          ${module.title ? `
            <div class="module-title">
              ${iconHtml}
              ${module.title}
            </div>
          ` : ""}
          <div class="space-y-2">
            ${(module.subtitle || module.timeRange) ? `
              <div class="flex items-center justify-between">
                ${module.subtitle ? `<h3 class="font-medium text-foreground">${module.subtitle}</h3>` : ""}
                ${module.timeRange ? `<span class="module-time">${module.timeRange}</span>` : ""}
              </div>
            ` : ""}
            <div class="module-content">
              ${renderMarkdown(module.content || "")}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${resumeData.title || "简历"}</title>
        ${style}
      </head>
      <body>
        <div class="resume-preview">
          <div class="resume-header">
            <div class="header-content">
              <h1 class="resume-title">${resumeData.title || "简历标题"}</h1>
              <div class="personal-info">
                ${personalInfoHtml}
              </div>
            </div>
            ${resumeData.avatar ? `<img src="${resumeData.avatar}" alt="头像" class="avatar" />` : ""}
          </div>
          
          <div class="space-y-6">
            ${modulesHtml}
          </div>
          
          ${resumeData.modules.length === 0 ? `
            <div style="text-align: center; margin-top: 50px; color: oklch(0.4 0.01 258.34);">
              <p>暂无简历内容</p>
            </div>
          ` : ""}
        </div>
      </body>
    </html>
  `;
}
