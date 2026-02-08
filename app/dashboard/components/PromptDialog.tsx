"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createRoute, updateRoute } from "../actions";
import type { Trip_Route } from "@prisma/client";
import { cn } from "@/lib/utils";

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">
            {mode === "create" ? "Новый маршрут" : "Редактировать маршрут"}
          </DialogTitle>
          <DialogDescription id="dialog-description" className="sr-only">
            {mode === "create"
              ? "Создание нового маршрута путешествия"
              : "Редактирование маршрута"}
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          {mode === "edit" && initialRoute && (
            <input type="hidden" name="id" value={initialRoute.id} />
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Название маршрута"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Описание</Label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Описание маршрута"
              className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Видимость</Label>
            <div className="flex gap-4">
              <label htmlFor="visibility-private" className="flex cursor-pointer items-center gap-2">
                <input
                  id="visibility-private"
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")}
                  className="h-4 w-4"
                />
                Приватный
              </label>
              <label htmlFor="visibility-public" className="flex cursor-pointer items-center gap-2">
                <input
                  id="visibility-public"
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

          <DialogFooter showCloseButton={false}>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Сохранение…" : "Сохранить"}
    </Button>
  );
}
