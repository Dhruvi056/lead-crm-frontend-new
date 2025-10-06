"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeight = 120,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML);
  };

  const exec = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    handleInput();
    editorRef.current?.focus();
  };

  return (
    <div className={className}>
      <div className="flex gap-1 mb-2">
        <Button type="button" variant="outline" size="sm" onClick={() => exec("bold")}>B</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec("italic")}><i>I</i></Button>
        <Button type="button" variant="outline" size="sm" onClick={() => exec("underline")}>U</Button>
       
      </div>
      <div
        ref={editorRef}
        onInput={handleInput}
        contentEditable
        role="textbox"
        aria-multiline
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}



