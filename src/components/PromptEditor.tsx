import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function PromptEditor({
  value,
  onChange,
  placeholder = "Cole seu prompt aqui...",
  className,
  readOnly = false,
}: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  useEffect(() => {
    const lines = value.split("\n").length;
    setLineNumbers(Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={cn("flex h-full rounded-lg overflow-hidden border border-border bg-editor-bg", className)}>
      {/* Line Numbers */}
      <div className="flex-shrink-0 w-12 bg-secondary/30 border-r border-border py-3 select-none">
        <div className="flex flex-col items-end pr-3 font-mono text-xs text-muted-foreground">
          {lineNumbers.map((num) => (
            <div key={num} className="h-6 leading-6">
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        className={cn(
          "flex-1 resize-none bg-transparent p-3 font-mono text-sm leading-6 text-foreground",
          "placeholder:text-muted-foreground/50 focus:outline-none scrollbar-thin",
          readOnly && "cursor-default"
        )}
      />
    </div>
  );
}
