"use client";

import type { CongratulationFormData } from "@/lib/validations";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";

interface TextTabProps {
  form: UseFormReturn<CongratulationFormData>;
}

export default function TextTab({ form }: TextTabProps) {
  const [useRichEditor, setUseRichEditor] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    if (!/iPad|iPhone|iPod/i.test(ua)) {
      setUseRichEditor(true);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="message-input" className="block text-sm font-medium mb-2">
          Текст поздравления
        </label>
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-black/30">
          {useRichEditor ? (
            <RichTextEditor form={form} />
          ) : (
            <textarea
              {...form.register("message")}
              id="message-input"
              name="message"
              data-testid="message-editor"
              className="w-full p-4 min-h-[200px] bg-transparent focus:outline-none"
              placeholder="Введите текст поздравления"
            />
          )}
        </div>
        {form.formState.errors.message && (
          <p className="mt-1 text-sm text-red-400">{form.formState.errors.message.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-400 text-right">
          {form.getValues("message")?.length || 0}/2000
        </p>
      </div>
    </div>
  );
}

function RichTextEditor({ form }: { form: UseFormReturn<CongratulationFormData> }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: form.getValues("message") || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "data-testid": "message-editor",
        "aria-label": "Текст поздравления",
      },
    },
    onUpdate: ({ editor }) => {
      const plainText = editor.getText();
      form.setValue("message", plainText);
    },
  });

  const focusEditor = () => {
    editor?.chain().focus().run();
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "message" && editor) {
        const nextValue = value.message || "";
        if (nextValue !== editor.getText()) {
          editor.commands.setContent(nextValue);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [editor, form]);

  if (!editor) {
    return (
      <textarea
        {...form.register("message")}
        id="message-input"
        name="message"
        data-testid="message-editor"
        className="w-full p-4 min-h-[200px] bg-transparent focus:outline-none"
        placeholder="Введите текст поздравления"
      />
    );
  }

  return (
    <div onClick={focusEditor} onKeyDown={focusEditor}>
      <EditorContent
        editor={editor}
        id="message-input"
        className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
