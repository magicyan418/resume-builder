"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd"
import { Icon } from "@iconify/react"
import IconPicker from "@/components/icon-picker"
import RichTextEditor from "@/components/rich-text-editor"
import { createNewModule } from "@/lib/resume-utils"
import type { ModuleContentMode, ResumeModule } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface ModuleEditorProps {
  modules: ResumeModule[]
  onUpdate: (modules: ResumeModule[]) => void
}

export default function ModuleEditor({ modules, onUpdate }: ModuleEditorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const addModule = () => {
    const newModule = createNewModule(modules.length)
    onUpdate([...modules, newModule])
    setExpandedModules((prev) => new Set([...prev, newModule.id]))
  }

  const updateModule = (id: string, updates: Partial<ResumeModule>) => {
    onUpdate(modules.map((module) => (module.id === id ? { ...module, ...updates } : module)))
  }

  const removeModule = (id: string) => {
    onUpdate(modules.filter((module) => module.id !== id))
    setExpandedModules((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination || source.index === destination.index) {
      return
    }

    const nextModules = [...modules]
    const [moved] = nextModules.splice(source.index, 1)
    nextModules.splice(destination.index, 0, moved)
    onUpdate(nextModules.map((module, index) => ({ ...module, order: index })))
  }

  return (
    <Card className="section-card">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:view-module" className="h-5 w-5 text-primary" />
          <h2 className="section-title">简历模块</h2>
        </div>
        <Button size="sm" variant="outline" onClick={addModule} className="gap-2 bg-transparent">
          <Icon icon="mdi:plus" className="h-4 w-4" />
          添加模块
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="modules-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {[...modules]
                .sort((a, b) => a.order - b.order)
                .map((module, index) => (
                  <Draggable key={module.id} draggableId={module.id} index={index}>
                    {(draggableProvided, snapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={{
                          ...draggableProvided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.82 : 1,
                        }}
                      >
                        <ModuleItemEditor
                          module={module}
                          isExpanded={expandedModules.has(module.id)}
                          onToggle={() => toggleModule(module.id)}
                          onUpdate={(updates) => updateModule(module.id, updates)}
                          onRemove={() => removeModule(module.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}

              {modules.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Icon icon="mdi:view-module-outline" className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">暂无简历模块，点击“添加模块”开始编辑。</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Card>
  )
}

interface ModuleItemEditorProps {
  module: ResumeModule
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<ResumeModule>) => void
  onRemove: () => void
}

function ModuleItemEditor({ module, isExpanded, onToggle, onUpdate, onRemove }: ModuleItemEditorProps) {
  const contentMode: ModuleContentMode = module.contentMode === "rich-text" ? "rich-text" : "markdown"

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="rounded-lg border bg-muted/30">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:drag" className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
              {module.icon ? (
                <svg width={16} height={16} viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: module.icon }} />
              ) : (
                <div className="h-4 w-4 rounded-sm border border-dashed border-gray-400" />
              )}
              <span className="font-medium">{module.title || "未命名模块"}</span>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {contentMode === "markdown" ? "Markdown" : "富文本"}
              </span>
              {module.subtitle && <span className="text-sm text-muted-foreground">- {module.subtitle}</span>}
            </div>
            <Icon icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} className="h-4 w-4 text-muted-foreground" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t p-3 pt-4">
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
                <Icon icon="mdi:delete" className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <Label className="form-label">大标题</Label>
                <Input
                  value={module.title}
                  onChange={(event) => onUpdate({ title: event.target.value })}
                  placeholder="例如：工作经历、项目经历"
                />
              </div>
              <div className="form-group">
                <Label className="form-label">图标</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      {module.icon ? (
                        <svg width={16} height={16} viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: module.icon }} />
                      ) : (
                        <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-dashed border-gray-400">
                          <span className="text-[8px] text-gray-400">无</span>
                        </div>
                      )}
                      选择图标
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>选择图标</DialogTitle>
                    </DialogHeader>
                    <IconPicker selectedIcon={module.icon} onSelect={(icon) => onUpdate({ icon })} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <Label className="form-label">副标题</Label>
                <Input
                  value={module.subtitle || ""}
                  onChange={(event) => onUpdate({ subtitle: event.target.value })}
                  placeholder="例如：公司名称、学校名称"
                />
              </div>
              <div className="form-group">
                <Label className="form-label">时间范围</Label>
                <Input
                  value={module.timeRange || ""}
                  onChange={(event) => onUpdate({ timeRange: event.target.value })}
                  placeholder="例如：2020.01 - 2023.12"
                />
              </div>
            </div>

            <div className="form-group space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="form-label">详细内容</Label>
                <div className="inline-flex rounded-md border bg-background p-1">
                  <Button
                    type="button"
                    variant={contentMode === "markdown" ? "default" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => onUpdate({ contentMode: "markdown" })}
                  >
                    Markdown
                  </Button>
                  <Button
                    type="button"
                    variant={contentMode === "rich-text" ? "default" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => onUpdate({ contentMode: "rich-text" })}
                  >
                    富文本
                  </Button>
                </div>
              </div>

              {contentMode === "markdown" ? (
                <MDEditor
                  value={module.content || ""}
                  onChange={(value = "") => onUpdate({ content: value })}
                  height={240}
                  data-color-mode="light"
                />
              ) : (
                <RichTextEditor
                  value={module.content || ""}
                  onChange={(value) => onUpdate({ content: value })}
                  placeholder="输入富文本内容，导出 PDF 时会按当前排版直接渲染。"
                />
              )}

              <p className="text-xs text-muted-foreground">
                Markdown 适合结构化编写；富文本适合所见即所得排版。两种模式都会参与预览和 Puppeteer 导出。
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
