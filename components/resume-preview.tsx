"use client"

import { Icon } from "@iconify/react"
import { renderModuleContent } from "@/lib/resume-content"
import type { ResumeData } from "@/types/resume"

interface ResumePreviewProps {
  resumeData: ResumeData
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  return (
    <div className="resume-preview resume-content">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="resume-title mb-4 text-2xl font-bold text-foreground">
            {resumeData.title || "简历标题"}
          </h1>

          <div className="personal-info grid grid-cols-2 gap-x-12 gap-y-2">
            {resumeData.personalInfo.map((item) => (
              <div key={item.id} className="personal-info-item flex items-center gap-2">
                {item.icon && (
                  <svg
                    className="resume-icon h-4 w-4 flex-shrink-0 -translate-y-[1px]"
                    fill="black"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: item.icon }}
                  />
                )}
                <span className="text-sm text-muted-foreground">{item.label}:</span>
                <span className="text-sm text-foreground">{item.value || "未填写"}</span>
              </div>
            ))}
          </div>
        </div>

        {resumeData.avatar && (
          <div>
            <img
              src={resumeData.avatar}
              alt="头像"
              className="resume-avatar h-20 w-20 rounded-full border-2 border-border object-cover"
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {[...resumeData.modules]
          .sort((a, b) => a.order - b.order)
          .map((module) => (
            <div key={module.id} className="resume-module">
              <div className="module-title mb-3 flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold text-foreground">
                {module.icon && (
                  <svg width={20} height={20} viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: module.icon }} />
                )}
                {module.title}
              </div>

              <div className="space-y-2">
                {(module.subtitle || module.timeRange) && (
                  <div className="flex items-center justify-between gap-4">
                    {module.subtitle ? (
                      <h3 className="font-medium text-foreground">{module.subtitle}</h3>
                    ) : (
                      <span />
                    )}
                    {module.timeRange && <span className="time-range text-sm text-muted-foreground">{module.timeRange}</span>}
                  </div>
                )}

                {module.content && (
                  <div
                    className="module-content max-w-none text-sm leading-relaxed text-foreground"
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "oklch(0.35 0.01 258.34)",
                    }}
                    dangerouslySetInnerHTML={{ __html: renderModuleContent(module) }}
                  />
                )}
              </div>
            </div>
          ))}
      </div>

      {resumeData.modules.length === 0 && (
        <div className="no-print py-12 text-center text-muted-foreground">
          <Icon icon="mdi:file-document-outline" className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>暂无简历内容，请在左侧编辑区域添加模块</p>
        </div>
      )}
    </div>
  )
}
