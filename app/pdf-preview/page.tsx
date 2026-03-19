"use client"

import { Suspense, useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import HtmlResumePreview from "@/components/html-resume-preview"
import PDFExportButton from "@/components/pdf-export-button"
import { Button } from "@/components/ui/button"
import type { ResumeData } from "@/types/resume"

function PDFPreviewContent() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeData")
    if (stored) {
      try {
        setResumeData(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse resume data", error)
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "resumeData") {
        return
      }

      setResumeData(event.data.data)
      sessionStorage.setItem("resumeData", JSON.stringify(event.data.data))
    }

    window.addEventListener("message", handleMessage)
    window.opener?.postMessage({ type: "ready" }, window.location.origin)

    return () => window.removeEventListener("message", handleMessage)
  }, [])

  if (!resumeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg text-muted-foreground">正在加载简历数据...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">PDF 预览</h1>
            <p className="text-sm text-muted-foreground">当前页面就是 Puppeteer 导出的视觉基准。</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-2">
              <Icon icon="mdi:printer-outline" className="h-4 w-4" />
              打印
            </Button>
            <Button onClick={() => window.close()} variant="outline" size="sm" className="gap-2">
              <Icon icon="mdi:close" className="h-4 w-4" />
              关闭
            </Button>
            <PDFExportButton resumeData={resumeData} size="sm" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <HtmlResumePreview resumeData={resumeData} className="min-h-[297mm] w-full border-0 bg-white" />
        </div>
      </div>
    </div>
  )
}

export default function PDFPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <PDFPreviewContent />
    </Suspense>
  )
}
