"use client"

import { buildResumeHtml } from "@/lib/export-html"
import { generatePdfFilename } from "@/lib/resume-utils"
import type { ResumeData } from "@/types/resume"

export async function downloadResumePdf(resumeData: ResumeData) {
  const html = buildResumeHtml(resumeData)

  const response = await fetch("/api/export/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html }),
  })

  if (!response.ok) {
    let details = "PDF 生成失败"

    try {
      const payload = await response.json()
      details = payload.details || payload.error || details
    } catch {
      details = response.statusText || details
    }

    throw new Error(details)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = generatePdfFilename(resumeData.title)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
