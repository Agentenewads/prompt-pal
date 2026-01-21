import { useState } from "react";
import { Button } from "./ui/button";
import { PromptEditor } from "./PromptEditor";
import { Check, Copy, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutputPanelProps {
  prompt: string;
  className?: string;
}

export function OutputPanel({ prompt, className }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const markdown = `# Prompt Otimizado\n\n\`\`\`\n${prompt}\n\`\`\`\n\n---\n*Gerado em ${new Date().toLocaleString("pt-BR")}*`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("flex flex-col h-full glass-card", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-success" />
          <h3 className="font-semibold text-foreground">Prompt Otimizado</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            .txt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            .md
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <PromptEditor value={prompt} onChange={() => {}} readOnly className="h-full" />
      </div>
    </div>
  );
}
