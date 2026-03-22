"use client";

import type { CongratulationFormData } from "@/lib/validations";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";

interface TextTabProps {
  form: UseFormReturn<CongratulationFormData>;
}

export default function TextTab({ form }: TextTabProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: form.getValues("message") || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // For plain text, strip HTML tags
      const plainText = editor.getText();
      form.setValue("message", plainText);
    },
  });

  const focusEditor = () => {
    editor?.chain().focus().run();
  };

  // Sync with form reset
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

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="message-input" className="block text-sm font-medium mb-2">
          Текст поздравления
        </label>
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-black/30">
          {editor ? (
            <div onClick={focusEditor} onKeyDown={focusEditor}>
              <EditorContent
                editor={editor}
                id="message-input"
                className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
                aria-label="Текст поздравления"
              />
            </div>
          ) : (
            <textarea
              {...form.register("message")}
              id="message-input"
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
