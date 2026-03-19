"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { downloadResumePdf } from "@/lib/pdf-client"
import type { ResumeData } from "@/types/resume"
import { Button } from "@/components/ui/button"

interface PDFExportButtonProps {
  resumeData: ResumeData
  variant?: "default" | "outline"
  size?: "default" | "sm"
}

export function PDFExportButton({
  resumeData,
  variant = "default",
  size = "default",
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) {
      return
    }

    setIsExporting(true)
    try {
      await downloadResumePdf(resumeData)
    } catch (error) {
      alert(`PDF 导出失败：${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={isExporting} className="gap-2">
      <Icon
        icon={isExporting ? "mdi:loading" : "mdi:file-pdf-box"}
        className={`h-4 w-4 ${isExporting ? "animate-spin" : ""}`}
      />
      {isExporting ? "生成中..." : "导出 PDF"}
    </Button>
  )
}

export default PDFExportButton
