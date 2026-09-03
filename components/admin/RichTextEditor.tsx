"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Eye,
  RemoveFormatting,
  CornerDownLeft,
  Check,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write product description...",
  name = "descriptionHtml",
  required = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [internalHtml, setInternalHtml] = useState(value || "");
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Sync initial and external prop changes to editor innerHTML
  useEffect(() => {
    setInternalHtml(value || "");
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isSourceMode]);

  // Update active formatting states for toolbar button highlights
  const checkActiveFormats = useCallback(() => {
    if (typeof document === "undefined") return;
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setInternalHtml(html);
      onChange(html);
      checkActiveFormats();
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setInternalHtml(html);
    onChange(html);
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const insertLineBreak = () => {
    executeCommand("insertHTML", "<br/>");
  };

  const insertParagraph = () => {
    executeCommand("formatBlock", "<p>");
  };

  const toggleSourceMode = () => {
    if (!isSourceMode) {
      // Switching from Visual to Source
      if (editorRef.current) {
        const currentHtml = editorRef.current.innerHTML;
        setInternalHtml(currentHtml);
        onChange(currentHtml);
      }
    } else {
      // Switching from Source to Visual
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = internalHtml;
        }
      }, 0);
    }
    setIsSourceMode(!isSourceMode);
  };

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest/40" style={{ borderColor: "rgba(26,26,26,0.15)" }}>
      {/* Hidden input to support standard HTML FormData submissions */}
      <input type="hidden" name={name} value={internalHtml} required={required} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-gray-50/80 border-b select-none text-gray-700 text-xs" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Styles */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            disabled={isSourceMode}
            onClick={() => executeCommand("bold")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.bold ? "bg-forest text-white" : "hover:bg-gray-200 text-gray-700"
            } disabled:opacity-40`}
          >
            <Bold size={15} />
          </button>

          <button
            type="button"
            title="Italic (Ctrl+I)"
            disabled={isSourceMode}
            onClick={() => executeCommand("italic")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.italic ? "bg-forest text-white" : "hover:bg-gray-200 text-gray-700"
            } disabled:opacity-40`}
          >
            <Italic size={15} />
          </button>

          <button
            type="button"
            title="Underline (Ctrl+U)"
            disabled={isSourceMode}
            onClick={() => executeCommand("underline")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.underline ? "bg-forest text-white" : "hover:bg-gray-200 text-gray-700"
            } disabled:opacity-40`}
          >
            <Underline size={15} />
          </button>

          <button
            type="button"
            title="Strikethrough"
            disabled={isSourceMode}
            onClick={() => executeCommand("strikeThrough")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.strikeThrough ? "bg-forest text-white" : "hover:bg-gray-200 text-gray-700"
            } disabled:opacity-40`}
          >
            <Strikethrough size={15} />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Headings */}
          <button
            type="button"
            title="Heading 2"
            disabled={isSourceMode}
            onClick={() => executeCommand("formatBlock", "<h2>")}
            className="px-2 py-1 font-semibold hover:bg-gray-200 rounded text-gray-700 disabled:opacity-40"
          >
            <Heading2 size={15} />
          </button>

          <button
            type="button"
            title="Heading 3"
            disabled={isSourceMode}
            onClick={() => executeCommand("formatBlock", "<h3>")}
            className="px-2 py-1 font-semibold hover:bg-gray-200 rounded text-gray-700 disabled:opacity-40"
          >
            <Heading3 size={15} />
          </button>

          <button
            type="button"
            title="Paragraph"
            disabled={isSourceMode}
            onClick={insertParagraph}
            className="px-2 py-1 font-sans text-xs font-semibold hover:bg-gray-200 rounded text-gray-700 disabled:opacity-40"
          >
            ¶
          </button>

          <div className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Lists */}
          <button
            type="button"
            title="Bullet List"
            disabled={isSourceMode}
            onClick={() => executeCommand("insertUnorderedList")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.insertUnorderedList ? "bg-forest text-white" : "hover:bg-gray-200 text-gray-700"
            } disabled:opacity-40`}
          >
            <List size={15} />
          </button>

          <button
            type="button"
            title="Numbered List"
            disabled={isSourceMode}
            onClick={() => executeCommand("insertOrderedList")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.insertOrderedList ? "bg-forest text-white" : "hover:bg-gray-200 text-gray-700"
            } disabled:opacity-40`}
          >
            <ListOrdered size={15} />
          </button>

          <button
            type="button"
            title="Line Break (<br>)"
            disabled={isSourceMode}
            onClick={insertLineBreak}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-40"
          >
            <CornerDownLeft size={15} />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-0.5" />

          {/* Clear Formatting */}
          <button
            type="button"
            title="Remove Formatting"
            disabled={isSourceMode}
            onClick={() => executeCommand("removeFormat")}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-40"
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        {/* View Mode Toggle: Visual vs HTML Source */}
        <div className="flex items-center gap-1 mt-1 sm:mt-0">
          <button
            type="button"
            onClick={toggleSourceMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isSourceMode
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200 shadow-2xs"
            }`}
          >
            {isSourceMode ? (
              <>
                <Eye size={13} />
                <span>Visual View</span>
              </>
            ) : (
              <>
                <Code size={13} />
                <span>HTML Source</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative min-h-[160px]">
        {isSourceMode ? (
          <textarea
            value={internalHtml}
            onChange={handleSourceChange}
            placeholder={placeholder}
            className="w-full min-h-[160px] p-4 font-mono text-xs text-gray-800 bg-gray-900/5 outline-none resize-y leading-relaxed"
            rows={7}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            onBlur={handleInput}
            role="textbox"
            aria-multiline="true"
            data-placeholder={placeholder}
            className="min-h-[160px] p-4 text-sm font-sans text-gray-800 outline-none overflow-y-auto leading-relaxed
              prose prose-sm max-w-none
              [&_h2]:text-xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1
              [&_h3]:text-base [&_h3]:font-serif [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
              [&_p]:my-1.5
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
              [&_li]:my-0.5
              [&_strong]:font-bold
              [&_b]:font-bold
              empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
          />
        )}
      </div>

      {/* Editor Footer / Info Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t text-[11px] text-gray-500 font-sans" style={{ borderColor: "rgba(26,26,26,0.08)" }}>
        <span className="flex items-center gap-1.5">
          <Check size={12} className="text-forest" />
          <span>{isSourceMode ? "Editing Raw HTML Source" : "WYSIWYG Visual Editor (HTML formatted)"}</span>
        </span>
        <span className="text-gray-400">
          {internalHtml.replace(/<[^>]*>?/gm, "").trim().length} characters
        </span>
      </div>
    </div>
  );
}
