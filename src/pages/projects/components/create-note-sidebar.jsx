import { Plus, Link as LinkIcon, FileIcon, X } from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NotionEditor } from "@/components/ui/notion-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const CREATE_NOTE_LABEL = "Create Note"

const CATEGORIES = [
  { value: "architecture", label: "Architecture", icon: "🏗️" },
  { value: "design", label: "Design", icon: "🎨" },
  { value: "documentation", label: "Documentation", icon: "📚" },
  { value: "guide", label: "Guide", icon: "📖" },
  { value: "reference", label: "Reference", icon: "📋" },
  { value: "other", label: "Other", icon: "📝" },
]

// Categories select component
const CategorySelect = ({ value, onChange, selectedCategory }) => (
  <div className="space-y-2">
    <Label htmlFor="note-category">Category</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="note-category">
        <SelectValue>
          {selectedCategory && (
            <span className="flex items-center gap-2">
              <span>{selectedCategory.icon}</span>
              {selectedCategory.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => (
          <SelectItem key={cat.value} value={cat.value}>
            <span className="flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

CategorySelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
}

CategorySelect.defaultProps = {
  selectedCategory: null,
}

// Links list component
const LinksList = ({ links, onRemove }) => {
  if (links.length === 0) return null
  return (
    <div className="space-y-1.5 mt-2">
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-2 bg-secondary/40 rounded-md text-xs gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
            >
              {link.url}
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(link.id)}
            className="h-5 w-5 p-0 shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

LinksList.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
}

// Files list component
const FilesList = ({ files, onRemove }) => {
  if (files.length === 0) return null
  return (
    <div className="space-y-1.5 mt-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-2 bg-secondary/40 rounded-md text-xs gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{file.name}</span>
          </div>
          <span className="text-muted-foreground whitespace-nowrap shrink-0">
            {(file.size / 1024).toFixed(1)} KB
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="h-5 w-5 p-0 shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

FilesList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
}

/**
 * CreateNoteSidebar - Sheet-based sidebar for creating project notes with links and files
 */
export const CreateNoteSidebar = ({
  triggerText = CREATE_NOTE_LABEL,
  variant = "default",
  size = "sm",
  className = "",
  onSubmit = undefined,
}) => {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState([])
  const [files, setFiles] = useState([])
  const [newLink, setNewLink] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "architecture",
  })

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const handleAddLink = () => {
    if (newLink.trim()) {
      try {
        new URL(newLink) // Validate URL
        setLinks([...links, { id: Date.now(), url: newLink }])
        setNewLink("")
      } catch {
        alert("Please enter a valid URL")
      }
    }
  }

  const handleRemoveLink = (id) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const handleAddFile = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setFiles([...files, { id: Date.now(), name: file.name, size: file.size }])
    }
  }

  const handleRemoveFile = (id) => {
    setFiles(files.filter((file) => file.id !== id))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...formData,
      links,
      files: files.map(({ id, name }) => ({ id, name })), // Don't send file object
    }
    onSubmit?.(payload)
    // Reset form
    setFormData({ title: "", content: "", category: "architecture" })
    setLinks([])
    setFiles([])
    setNewLink("")
    setOpen(false)
  }

  const selectedCategory = CATEGORIES.find((c) => c.value === formData.category)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Plus className="h-4 w-4" />
          {triggerText}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5 text-primary" />
            Create Project Note
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Document architecture decisions, add links, and share files with
            your team.
          </p>
        </SheetHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-0">
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="note-title">Title *</Label>
              <Input
                id="note-title"
                placeholder="e.g. Database Schema Design"
                value={formData.title}
                onChange={(event) => handleChange("title", event.target.value)}
                required
              />
            </div>

            {/* Category */}
            <CategorySelect
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              selectedCategory={selectedCategory}
            />

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Content *</Label>
              <NotionEditor
                value={formData.content}
                onChange={(value) => handleChange("content", value)}
                placeholder="Start writing your note..."
                minHeight={220}
              />
            </div>

            {/* Add Links Section */}
            <div className="space-y-2">
              <Label htmlFor="note-link">Add Links</Label>
              <div className="flex gap-2">
                <Input
                  id="note-link"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(event) => setNewLink(event.target.value)}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      handleAddLink()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddLink}
                  className="px-3"
                  title="Add link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <LinksList links={links} onRemove={handleRemoveLink} />
            </div>

            {/* Files Section */}
            <div className="space-y-2">
              <Label htmlFor="note-file">Attach Files</Label>
              <div className="relative">
                <input
                  id="note-file"
                  type="file"
                  onChange={handleAddFile}
                  className="block w-full text-xs text-muted-foreground
                    file:mr-4 file:py-2 file:px-3
                    file:rounded-md file:border-0
                    file:text-xs file:font-medium
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    cursor-pointer"
                />
              </div>
              <FilesList files={files} onRemove={handleRemoveFile} />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Footer Actions */}
          <div className="flex gap-2 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Note
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

CreateNoteSidebar.defaultProps = {
  triggerText: CREATE_NOTE_LABEL,
  variant: "default",
  size: "sm",
  className: "",
  onSubmit: undefined,
}

CreateNoteSidebar.propTypes = {
  triggerText: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  onSubmit: PropTypes.func,
}
