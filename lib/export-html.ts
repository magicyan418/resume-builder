import type { ResumeData } from "@/types/resume"
import {
  escapeHtml,
  formatPersonalInfoDisplay,
  renderModuleContent,
} from "@/lib/resume-content"

export function buildResumeHtml(resumeData: ResumeData): string {
  const personalInfoHtml = resumeData.personalInfo
    .map((item) => {
      const iconHtml = item.icon
        ? `<svg class="resume-icon" width="16" height="16" viewBox="0 0 24 24" fill="black">${item.icon}</svg>`
        : ""

      return `
        <div class="personal-info-item">
          ${iconHtml}
          <span class="personal-info-label">${escapeHtml(item.label)}:</span>
          <span class="personal-info-value">${escapeHtml(
            formatPersonalInfoDisplay(item.label, item.value || "未填写"),
          )}</span>
        </div>
      `
    })
    .join("")

  const modulesHtml = [...resumeData.modules]
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const iconHtml = module.icon
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="black">${module.icon}</svg>`
        : ""

      return `
        <section class="resume-module">
          ${
            module.title
              ? `
                <div class="module-title">
                  ${iconHtml}
                  <span>${escapeHtml(module.title)}</span>
                </div>
              `
              : ""
          }
          <div class="module-body">
            ${
              module.subtitle || module.timeRange
                ? `
                  <div class="module-meta">
                    ${module.subtitle ? `<h3>${escapeHtml(module.subtitle)}</h3>` : "<span></span>"}
                    ${module.timeRange ? `<span class="module-time">${escapeHtml(module.timeRange)}</span>` : ""}
                  </div>
                `
                : ""
            }
            <div class="module-content">
              ${renderModuleContent(module)}
            </div>
          </div>
        </section>
      `
    })
    .join("")

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(resumeData.title || "简历")}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #f3f4f6;
            color: #1f2937;
            font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            padding: 24px;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #fff;
            padding: 18mm 16mm;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
          }

          .resume-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 28px;
          }

          .header-content {
            flex: 1;
            min-width: 0;
          }

          .resume-title {
            margin: 0 0 16px;
            font-size: 28px;
            line-height: 1.2;
            font-weight: 700;
          }

          .personal-info {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 40px;
          }

          .personal-info-item {
            display: grid;
            grid-template-columns: 16px auto minmax(0, 1fr);
            align-items: start;
            column-gap: 12px;
            min-width: 0;
            font-size: 14px;
          }

          .personal-info-label {
            color: #6b7280;
            white-space: nowrap;
          }

          .personal-info-value {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.7;
          }

          .resume-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }

          .avatar {
            width: 84px;
            height: 84px;
            border-radius: 999px;
            object-fit: cover;
            border: 2px solid #e5e7eb;
          }

          .resume-module {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          .module-title {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 8px;
            margin-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 18px;
            font-weight: 600;
          }

          .module-meta {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 8px;
          }

          .module-meta h3 {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
          }

          .module-time {
            color: #6b7280;
            font-size: 13px;
            white-space: nowrap;
          }

          .module-content {
            font-size: 14px;
            line-height: 1.7;
            overflow-wrap: anywhere;
          }

          .module-content h1,
          .module-content h2,
          .module-content h3,
          .module-content h4,
          .module-content h5,
          .module-content h6 {
            margin: 14px 0 8px;
            line-height: 1.35;
          }

          .module-content p,
          .module-content ul,
          .module-content ol,
          .module-content blockquote,
          .module-content pre,
          .module-content table {
            margin: 10px 0;
          }

          .module-content ul,
          .module-content ol {
            padding-left: 20px;
          }

          .module-content blockquote {
            margin-left: 0;
            padding-left: 14px;
            border-left: 3px solid #d1d5db;
            color: #4b5563;
          }

          .module-content code {
            padding: 2px 6px;
            border-radius: 4px;
            background: #f3f4f6;
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 13px;
          }

          .module-content pre {
            padding: 12px;
            border-radius: 8px;
            background: #f3f4f6;
            overflow: hidden;
          }

          .module-content pre code {
            background: transparent;
            padding: 0;
          }

          .module-content table {
            width: 100%;
            border-collapse: collapse;
          }

          .module-content th,
          .module-content td {
            border: 1px solid #e5e7eb;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
          }

          .module-content a {
            color: #0369a1;
            text-decoration: none;
          }

          .module-content img {
            max-width: 100%;
          }

          @media print {
            html,
            body {
              background: #fff;
            }

            body {
              padding: 0;
            }

            .page {
              width: auto;
              min-height: auto;
              padding: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header class="resume-header">
            <div class="header-content">
              <h1 class="resume-title">${escapeHtml(resumeData.title || "简历标题")}</h1>
              <div class="personal-info">
                ${personalInfoHtml}
              </div>
            </div>
            ${resumeData.avatar ? `<img src="${resumeData.avatar}" alt="头像" class="avatar" />` : ""}
          </header>
          ${modulesHtml}
          ${
            resumeData.modules.length === 0
              ? `<div style="padding: 48px 0; text-align: center; color: #6b7280;">暂无简历内容</div>`
              : ""
          }
        </main>
      </body>
    </html>
  `
}
