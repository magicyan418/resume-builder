"use client"

import { useMemo } from "react"
import { buildResumeHtml } from "@/lib/export-html"
import type { ResumeData } from "@/types/resume"

interface HtmlResumePreviewProps {
  resumeData: ResumeData
  className?: string
}

export default function HtmlResumePreview({ resumeData, className }: HtmlResumePreviewProps) {
  const html = useMemo(() => buildResumeHtml(resumeData), [resumeData])

  return (
    <iframe
      title="Resume HTML Preview"
      srcDoc={html}
      className={className ?? "h-full w-full border-0 bg-white"}
    />
  )
}
