import type {
  MagicyanFile,
  PersonalInfoItem,
  ResumeData,
  ResumeModule,
} from "@/types/resume"

function normalizeModule(module: ResumeModule, order: number): ResumeModule {
  return {
    ...module,
    subtitle: module.subtitle ?? "",
    timeRange: module.timeRange ?? "",
    content: module.content ?? "",
    contentMode: module.contentMode === "rich-text" ? "rich-text" : "markdown",
    order,
  }
}

export function createNewModule(order: number): ResumeModule {
  return {
    id: `module-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    title: "新模块",
    subtitle: "",
    timeRange: "",
    content: "",
    contentMode: "markdown",
    icon: "mdi:text-box",
    order,
  }
}

export function createNewPersonalInfoItem(): PersonalInfoItem {
  return {
    id: `info-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    label: "新标签",
    value: "",
    icon: "mdi:information",
  }
}

export function exportToMagicyanFile(resumeData: ResumeData): string {
  const payload: MagicyanFile = {
    version: "1.1.0",
    data: {
      ...resumeData,
      modules: resumeData.modules.map((module, index) => normalizeModule(module, index)),
      updatedAt: new Date().toISOString(),
    },
    metadata: {
      exportedAt: new Date().toISOString(),
      appVersion: "1.1.0",
    },
  }

  return JSON.stringify(payload, null, 2)
}

export function importFromMagicyanFile(fileContent: string): ResumeData {
  try {
    if (!fileContent.trim()) {
      throw new Error("文件内容为空")
    }

    const parsed = JSON.parse(fileContent) as MagicyanFile

    if (!parsed || typeof parsed !== "object") {
      throw new Error("无效的文件格式")
    }

    if (!parsed.version) {
      throw new Error("缺少版本信息")
    }

    if (!parsed.data) {
      throw new Error("缺少简历数据")
    }

    const data = parsed.data
    if (!data.title || typeof data.title !== "string") {
      throw new Error("简历标题格式错误")
    }

    if (!Array.isArray(data.personalInfo)) {
      throw new Error("个人信息格式错误")
    }

    if (!Array.isArray(data.modules)) {
      throw new Error("简历模块格式错误")
    }

    for (const item of data.personalInfo) {
      if (!item.id || !item.label || typeof item.value !== "string") {
        throw new Error("个人信息项格式错误")
      }
    }

    for (const module of data.modules) {
      if (!module.id || typeof module.title !== "string" || typeof module.order !== "number") {
        throw new Error("简历模块格式错误")
      }
    }

    const now = new Date().toISOString()
    return {
      ...data,
      modules: data.modules.map((module, index) => normalizeModule(module, index)),
      createdAt: data.createdAt || now,
      updatedAt: now,
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("文件格式不正确，请确认是有效的 JSON 文件")
    }

    throw error
  }
}

export function downloadFile(content: string, filename: string, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generatePdfFilename(resumeTitle: string): string {
  const timestamp = new Date().toISOString().slice(0, 10)
  const cleanTitle = resumeTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")
  return `${cleanTitle}_${timestamp}.pdf`
}

export function validateResumeData(data: ResumeData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title?.trim()) {
    errors.push("简历标题不能为空")
  }

  if (!Array.isArray(data.personalInfo)) {
    errors.push("个人信息格式错误")
  } else {
    data.personalInfo.forEach((item, index) => {
      if (!item.id || !item.label?.trim()) {
        errors.push(`个人信息第 ${index + 1} 项格式错误`)
      }
    })
  }

  if (!Array.isArray(data.modules)) {
    errors.push("简历模块格式错误")
  } else {
    data.modules.forEach((module, index) => {
      if (!module.id || typeof module.title !== "string") {
        errors.push(`简历模块第 ${index + 1} 项格式错误`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
