"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import type { ResumeData } from "@/types/resume";
import { buildResumeHtml } from "@/lib/export-html";

interface PDFExportButtonProps {
  resumeData: ResumeData;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

export function PDFExportButton({
  resumeData,
  variant = "default",
  size = "default",
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const previewHtml = async () => {
    try {
      const html = buildResumeHtml(resumeData);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (error) {
      console.error("HTML 预览错误:", error);
      alert("HTML 预览失败");
    }
  };

  const exportResumePdf = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      // 生成完整的 HTML 内容
      const html = buildResumeHtml(resumeData);
      
      // 在本地开发环境，先测试 HTML 生成
      if (process.env.NODE_ENV === "development") {
        console.log("生成的 HTML 长度:", html.length);
        console.log("HTML 预览:", html.substring(0, 500) + "...");
      }
      
      // 调用 API 生成 PDF
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API 错误响应:", errorData);
        throw new Error(errorData.details || errorData.error || "PDF 生成失败");
      }

      // 获取 PDF 数据并下载
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("PDF 导出错误:", error);
      alert(`PDF 导出失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={previewHtml}
        className="gap-2"
      >
        <Icon icon="mdi:eye" className="w-4 h-4" />
        预览HTML
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={exportResumePdf}
        disabled={isExporting}
        className="gap-2"
      >
        <Icon 
          icon={isExporting ? "mdi:loading" : "mdi:file-pdf-box"} 
          className={`w-4 h-4 ${isExporting ? "animate-spin" : ""}`} 
        />
        {isExporting ? "生成中..." : "导出PDF"}
      </Button>
    </div>
  );
}

export default PDFExportButton;
