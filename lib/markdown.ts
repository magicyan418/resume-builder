import { marked } from "marked";

/**
 * 将 Markdown 文本转换为 HTML
 * @param md Markdown 文本
 * @returns HTML 字符串
 */
export function renderMarkdown(md: string): string {
  if (!md) return "";
  
  try {
    return marked.parse(md) as string;
  } catch (error) {
    console.error("Markdown 解析错误:", error);
    return md; // 解析失败时返回原文本
  }
}

/**
 * 配置 marked 选项
 */
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 支持 GitHub 风格的 Markdown
});
