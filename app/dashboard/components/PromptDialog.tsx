"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createRoute, updateRoute } from "../actions";
import type { Trip_Route } from "@prisma/client";

type PromptDialogProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialRoute?: Trip_Route | null;
};

export function PromptDialog({
  open,
  onClose,
  mode,
  initialRoute,
}: PromptDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialRoute) {
        setTitle(initialRoute.title);
        setContent(initialRoute.content);
        setVisibility(initialRoute.visibility);
      } else {
        setTitle("");
        setContent("");
        setVisibility("PRIVATE");
      }
    }
  }, [open, mode, initialRoute]);

  const [createState, createAction] = useFormState(createRoute, {});
  const [updateState, updateAction] = useFormState(updateRoute, {});

  const state = mode === "create" ? createState : updateState;
  const action = mode === "create" ? createAction : updateAction;

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-slate-900">
          {mode === "create" ? "Новый маршрут" : "Редактировать маршрут"}
        </h2>

        <form action={action} className="mt-4 flex flex-col gap-4">
          {mode === "edit" && initialRoute && (
            <input type="hidden" name="id" value={initialRoute.id} />
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Заголовок
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700">
              Описание
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700">
              Видимость
            </span>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")}
                  className="h-4 w-4"
                />
                Приватный
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === "PUBLIC"}
                  onChange={() => setVisibility("PUBLIC")}
                  className="h-4 w-4"
                />
                Публичный
              </label>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Отмена
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Сохранение…" : "Сохранить"}
    </button>
  );
}
