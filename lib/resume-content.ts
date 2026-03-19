import type { ModuleContentMode, ResumeModule } from "@/types/resume"
import { renderMarkdown } from "@/lib/markdown"

export function normalizeContentMode(mode?: ModuleContentMode): ModuleContentMode {
  return mode === "rich-text" ? "rich-text" : "markdown"
}

export function renderModuleContent(module: Pick<ResumeModule, "content" | "contentMode">): string {
  if (!module.content) {
    return ""
  }

  return normalizeContentMode(module.contentMode) === "rich-text"
    ? module.content
    : renderMarkdown(module.content)
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function formatPersonalInfoDisplay(label: string, value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  if (label.toLowerCase().includes("github")) {
    return trimmed.replace(/^@/, "")
  }

  return trimmed
}
