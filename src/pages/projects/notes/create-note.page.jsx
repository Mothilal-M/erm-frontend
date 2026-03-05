import { ArrowLeft, Save, FileText, Image, Layout, List } from "lucide-react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"

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

const CreateNotePage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState()
  const [coverImage, setCoverImage] = useState("")
  const [shareScope, setShareScope] = useState("team")
  const [specificAccess, setSpecificAccess] = useState("")

  const handleSave = () => {
    // Save logic here
    console.log("Saving note:", {
      title,
      content,
      coverImage,
      shareScope,
      specificAccess: shareScope === "specific" ? specificAccess : "",
    })
    navigate(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/projects")}
            >
              Projects
            </span>
            <span>/</span>
            <span
              className="hover:underline cursor-pointer"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              PRJ-{projectId}
            </span>
            <span>/</span>
            <span className="text-foreground">New Note</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={shareScope} onValueChange={setShareScope}>
            <SelectTrigger className="w-35 h-9" aria-label="Share setting">
              <SelectValue placeholder="Share setting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="specific">Specific</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} className="gap-2 rounded-full px-6">
            <Save className="h-4 w-4" /> Publish
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          {shareScope === "specific" && (
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <Label htmlFor="note-specific-access">
                Specific Access (emails or usernames)
              </Label>
              <Input
                id="note-specific-access"
                value={specificAccess}
                onChange={(event) => setSpecificAccess(event.target.value)}
                placeholder="e.g. alex@company.com, priya@company.com"
              />
            </div>
          )}

          {/* Cover Image Placeholder Space */}
          {coverImage ? (
            <div className="w-full h-64 rounded-xl overflow-hidden mb-8 group relative bg-muted">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCoverImage("")}
                >
                  Remove Cover
                </Button>
                <Button variant="secondary" size="sm">
                  Change Cover
                </Button>
              </div>
            </div>
          ) : (
            <div className="group flex gap-3 text-muted-foreground mb-4 opacity-60 hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() =>
                  setCoverImage(
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                  )
                }
              >
                <Image className="h-4 w-4" /> Add cover
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Layout className="h-4 w-4" /> Add icon
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <FileText className="h-4 w-4" /> Add description
              </Button>
            </div>
          )}

          {/* Title Editor */}
          <div className="mb-8">
            <input
              type="text"
              name="title"
              placeholder="Untitled Document"
              className="w-full text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 resize-none overflow-hidden"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <Separator className="my-8 opacity-50" />

          {/* Block Editor */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <NotionEditor
              value={content}
              onChange={setContent}
              placeholder="Press '/' for commands..."
              minHeight={600}
            />
          </div>

          {/* Bottom spacer for comfortable scrolling */}
          <div className="h-64"></div>
        </div>
      </main>
    </div>
  )
}

export default CreateNotePage
