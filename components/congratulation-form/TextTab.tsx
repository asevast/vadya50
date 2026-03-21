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
      const html = editor.getHTML();
      // For plain text, strip HTML tags
      const plainText = editor.getText();
      form.setValue("message", plainText);
    },
  });

  // Sync with form reset
  useEffect(() => {
    if (editor && form.getValues("message") !== editor.getText()) {
      editor.commands.setContent(form.getValues("message") || "");
    }
  }, [editor, form.watch("message")]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Текст поздравления</label>
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-black/30">
          <EditorContent
            editor={editor}
            className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
          />
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
