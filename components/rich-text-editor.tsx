"use client"

import { useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const toolbarItems = [
  { icon: "mdi:format-bold", command: "bold", label: "加粗" },
  { icon: "mdi:format-italic", command: "italic", label: "斜体" },
  { icon: "mdi:format-list-bulleted", command: "insertUnorderedList", label: "无序列表" },
  { icon: "mdi:format-list-numbered", command: "insertOrderedList", label: "有序列表" },
  { icon: "mdi:format-quote-close", command: "formatBlock", value: "blockquote", label: "引用" },
  { icon: "mdi:code-tags", command: "formatBlock", value: "pre", label: "代码块" },
] as const

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const editor = editorRef.current
    if (editor && editor.innerHTML !== value) {
      editor.innerHTML = value || ""
    }
  }, [value])

  const runCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    editor.focus()
    document.execCommand(command, false, commandValue)
    onChange(editor.innerHTML)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
        {toolbarItems.map((item) => (
          <Button
            key={`${item.command}-${item.label}`}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => runCommand(item.command, item.value)}
          >
            <Icon icon={item.icon} className="h-4 w-4" />
            <span className="sr-only">{item.label}</span>
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => runCommand("removeFormat")}>
          <Icon icon="mdi:format-clear" className="h-4 w-4" />
          <span className="sr-only">清除格式</span>
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="min-h-[220px] px-4 py-3 text-sm leading-6 outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  )
}
