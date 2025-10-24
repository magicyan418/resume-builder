"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icon } from "@iconify/react"
import dynamic from "next/dynamic"
import type { ResumeModule } from "@/types/resume"
import { createNewModule } from "@/lib/resume-utils"
import IconPicker from "./icon-picker"

// 动态引入MDEditor，避免SSR问题
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface ModuleEditorProps {
  modules: ResumeModule[]
  onUpdate: (modules: ResumeModule[]) => void
}

/**
 * 简历模块编辑器组件
 */
export default function ModuleEditor({ modules, onUpdate }: ModuleEditorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  /**
   * 添加新模块
   */
  const addModule = () => {
    const newModule = createNewModule(modules.length)
    const updatedModules = [...modules, newModule]
    onUpdate(updatedModules)
    // 自动展开新添加的模块
    setExpandedModules((prev) => new Set([...prev, newModule.id]))
  }

  /**
   * 更新模块
   */
  const updateModule = (id: string, updates: Partial<ResumeModule>) => {
    const updatedModules = modules.map((module) => (module.id === id ? { ...module, ...updates } : module))
    onUpdate(updatedModules)
  }

  /**
   * 删除模块
   */
  const removeModule = (id: string) => {
    const updatedModules = modules.filter((module) => module.id !== id)
    onUpdate(updatedModules)
    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  /**
   * 移动模块位置
   */
  const moveModule = (id: string, direction: "up" | "down") => {
    const currentIndex = modules.findIndex((module) => module.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= modules.length) return

    const updatedModules = [...modules]
    const [movedModule] = updatedModules.splice(currentIndex, 1)
    updatedModules.splice(newIndex, 0, movedModule)

    // 重新设置order
    updatedModules.forEach((module, index) => {
      module.order = index
    })

    onUpdate(updatedModules)
  }

  /**
   * 切换模块展开状态
   */
  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <Card className="section-card">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:view-module" className="w-5 h-5 text-primary" />
          <h2 className="section-title">简历模块</h2>
        </div>
        <Button size="sm" variant="outline" onClick={addModule} className="gap-2 bg-transparent">
          <Icon icon="mdi:plus" className="w-4 h-4" />
          添加模块
        </Button>
      </div>

      <div className="space-y-3">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((module, index) => (
            <ModuleItemEditor
              key={module.id}
              module={module}
              isExpanded={expandedModules.has(module.id)}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              onToggle={() => toggleModule(module.id)}
              onUpdate={(updates) => updateModule(module.id, updates)}
              onRemove={() => removeModule(module.id)}
              onMove={(direction) => moveModule(module.id, direction)}
            />
          ))}

        {modules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon icon="mdi:view-module-outline" className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无简历模块，点击"添加模块"开始编辑</p>
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * 模块项编辑器
 */
interface ModuleItemEditorProps {
  module: ResumeModule
  isExpanded: boolean
  isFirst: boolean
  isLast: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<ResumeModule>) => void
  onRemove: () => void
  onMove: (direction: "up" | "down") => void
}

function ModuleItemEditor({
  module,
  isExpanded,
  isFirst,
  isLast,
  onToggle,
  onUpdate,
  onRemove,
  onMove,
}: ModuleItemEditorProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="border rounded-lg bg-muted/30">
        {/* 模块头部 */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {module.icon ? (
                <svg width={16} height={16} viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: module.icon }} />
              ) : (
                <div className="w-4 h-4 border border-dashed border-gray-400 rounded-sm" />
              )}
              <span className="font-medium">{module.title || "未命名模块"}</span>
              {module.subtitle && <span className="text-sm text-muted-foreground">- {module.subtitle}</span>}
            </div>
            <div className="flex items-center gap-1">
              <Icon
                icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="w-4 h-4 text-muted-foreground"
              />
            </div>
          </div>
        </CollapsibleTrigger>

        {/* 模块内容编辑 */}
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-4 border-t">
            {/* 工具栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMove("up")}
                  disabled={isFirst}
                  className="icon-button"
                >
                  <Icon icon="mdi:arrow-up" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMove("down")}
                  disabled={isLast}
                  className="icon-button"
                >
                  <Icon icon="mdi:arrow-down" className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="icon-button text-destructive hover:text-destructive"
              >
                <Icon icon="mdi:delete" className="w-4 h-4" />
              </Button>
            </div>

            {/* 基本信息编辑 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <Label className="form-label">大标题</Label>
                <Input
                  value={module.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="如：工作经历、教育背景"
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
                        <div className="w-4 h-4 border border-dashed border-gray-400 rounded-sm flex items-center justify-center">
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
                  onChange={(e) => onUpdate({ subtitle: e.target.value })}
                  placeholder="如：公司名称、学校名称（可选）"
                />
              </div>
              <div className="form-group">
                <Label className="form-label">时间范围</Label>
                <Input
                  value={module.timeRange || ""}
                  onChange={(e) => onUpdate({ timeRange: e.target.value })}
                  placeholder="如：2020.01 - 2023.12（可选）"
                />
              </div>
            </div>

            <div className="form-group">
              <Label className="form-label">详细内容</Label>
              <MDEditor
                value={module.content || ""}
                onChange={(val = "") => onUpdate({ content: val })}
                height={200}
                data-color-mode="light"
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
