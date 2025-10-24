"use client";

import { Icon } from "@iconify/react";
import type { ResumeData } from "@/types/resume";
import { renderMarkdown } from "@/lib/markdown";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

/**
 * 简历预览组件
 */
export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  return (
    <div className="resume-preview resume-content">
      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="resume-title text-2xl font-bold text-foreground mb-4">
            {resumeData.title || "简历标题"}
          </h1>

          {/* 个人信息 */}
          <div className="personal-info grid grid-cols-2 gap-x-6 gap-y-2">
            {resumeData.personalInfo.map((item) => (
              <div
                key={item.id}
                className="personal-info-item flex items-center gap-2"
              >
                {item.icon && (
                  <svg
                    className="resume-icon w-4 h-4
                     flex-shrink-0 transform -translate-y-[-1px]"
                    fill="black"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: item.icon }}
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  {item.label}:
                </span>
                <span className="text-sm text-foreground">
                  {item.value || "未填写"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 头像 */}
        {resumeData.avatar && (
          <div className="ml-6">
            <img
              src={resumeData.avatar}
              alt="头像"
              className="resume-avatar w-20 h-20 rounded-full object-cover border-2 border-border"
            />
          </div>
        )}
      </div>

      {/* 简历模块 */}
      <div className="space-y-6">
        {resumeData.modules
          .sort((a, b) => a.order - b.order)
          .map((module) => (
            <div key={module.id} className="resume-module">
              <div className="module-title text-lg font-semibold text-foreground border-b border-border pb-2 mb-3 flex items-center gap-2">
                {module.icon && (
                  <svg
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: module.icon }}
                  />
                )}
                {module.title}
              </div>

              <div className="space-y-2">
                {/* 副标题和时间 */}
                {(module.subtitle || module.timeRange) && (
                  <div className="flex items-center justify-between">
                    {module.subtitle && (
                      <h3 className="font-medium text-foreground">
                        {module.subtitle}
                      </h3>
                    )}
                    {module.timeRange && (
                      <span className="text-sm text-muted-foreground time-range">
                        {module.timeRange}
                      </span>
                    )}
                  </div>
                )}

                {/* 内容 */}
                {module.content && (
                  <div 
                    className="module-content text-sm text-foreground leading-relaxed max-w-none"
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: 'oklch(0.35 0.01 258.34)'
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(module.content) }}
                  />
                )}
              </div>
            </div>
          ))}
      </div>

      {/* 空状态提示 */}
      {resumeData.modules.length === 0 && (
        <div className="text-center py-12 text-muted-foreground no-print">
          <Icon
            icon="mdi:file-document-outline"
            className="w-12 h-12 mx-auto mb-4 opacity-50"
          />
          <p>暂无简历内容，请在左侧编辑区域添加模块</p>
        </div>
      )}
    </div>
  );
}
