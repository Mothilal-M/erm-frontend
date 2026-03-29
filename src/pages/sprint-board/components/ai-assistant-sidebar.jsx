import { Bot, Send, X, AlertCircle } from "lucide-react"
import PropTypes from "prop-types"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAIChat } from "@/services/query/ai.query"

const AIAssistantSidebar = ({ isOpen, onClose, sprintId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I'm your AI Sprint Assistant. How can I help you today?",
      type: "text",
    },
    {
      id: 2,
      role: "assistant",
      content:
        "I noticed 2 tasks are at risk of missing the sprint deadline. Would you like me to suggest reassignments?",
      type: "insight",
      icon: AlertCircle,
      color: "text-red-500",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const aiChatMutation = useAIChat()

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      type: "text",
    }

    setMessages((previous) => [...previous, newMessage])
    setInputValue("")

    aiChatMutation.mutate(
      {
        payload: {
          message: newMessage.content,
          sprintId,
        },
      },
      {
        onSuccess: (response) => {
          setMessages((previous) => [
            ...previous,
            {
              id: Date.now() + 1,
              role: "assistant",
              content: response.reply,
              type: "text",
            },
          ])
        },
        onError: () => {
          setMessages((previous) => [
            ...previous,
            {
              id: Date.now() + 1,
              role: "assistant",
              content:
                "Unable to reach AI assistant right now. Please try again.",
              type: "text",
            },
          ])
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full shadow-xl z-50 absolute right-0 top-0 bottom-0 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Sprint {sprintId}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`rounded-lg p-3 max-w-[85%] text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.type === "insight"
                      ? "bg-muted border border-border"
                      : "bg-muted/50"
                }`}
              >
                {message.type === "insight" && message.icon && (
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    <message.icon className={`h-4 w-4 ${message.color}`} />
                    Insight
                  </div>
                )}
                <p className="leading-relaxed">{message.content}</p>

                {message.type === "insight" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                    >
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/10">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted whitespace-nowrap text-xs"
          >
            Summarize Standup
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted whitespace-nowrap text-xs"
          >
            Find Blockers
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-muted whitespace-nowrap text-xs"
          >
            Estimate Tasks
          </Badge>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Ask AI Assistant..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="flex-1 text-sm h-9"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={!inputValue.trim() || aiChatMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

AIAssistantSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sprintId: PropTypes.string,
}

AIAssistantSidebar.defaultProps = {
  sprintId: undefined,
}

export default AIAssistantSidebar
