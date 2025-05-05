import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface Message {
  id: number
  text: string
  isSender: boolean
}

export default function Chat() {
  const messages: Message[] = [
    { id: 1, text: "No logro escucharlo", isSender: false },
    { id: 2, text: "Dame un segundo, lo reviso", isSender: true },
    { id: 3, text: "Okaaa", isSender: false },
  ]

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.isSender
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form className="flex gap-2">
          <Input
            placeholder="Escriba su mensaje..."
            className="flex-1"
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}