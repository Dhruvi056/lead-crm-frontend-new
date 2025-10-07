"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
    updateButtonStates();
  }, [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const handleSelectionChange = () => {
      updateButtonStates();
    };

    const handleClick = () => {
      setTimeout(updateButtonStates, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    el.addEventListener('click', handleClick);
    el.addEventListener('keyup', handleClick);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      el.removeEventListener('click', handleClick);
      el.removeEventListener('keyup', handleClick);
    };
  }, []);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML);
    updateButtonStates();
  };

  const updateButtonStates = () => {
    const el = editorRef.current;
    if (!el) return;
    
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
  };

  const exec = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    handleInput();
    editorRef.current?.focus();
  };

  return (
    <div className={className}>
      <div className="flex gap-1 mb-2">
        <Button 
          type="button" 
          variant={isBold ? "default" : "outline"} 
          size="sm" 
          onClick={() => exec("bold")}
          className={isBold ? "bg-gray-300 text-gray-800 hover:bg-gray-400" : ""}
        >
          B
        </Button>
        <Button 
          type="button" 
          variant={isItalic ? "default" : "outline"} 
          size="sm" 
          onClick={() => exec("italic")}
          className={isItalic ? "bg-gray-300 text-gray-800 hover:bg-gray-400" : ""}
        >
          <i>I</i>
        </Button>
        <Button 
          type="button" 
          variant={isUnderline ? "default" : "outline"} 
          size="sm" 
          onClick={() => exec("underline")}
          className={isUnderline ? "bg-gray-300 text-gray-800 hover:bg-gray-400" : ""}
        >
          U
        </Button>
       
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



