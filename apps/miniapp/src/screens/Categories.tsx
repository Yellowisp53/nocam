import { FolderOpen, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useStore } from "../data/store";
import type { Category } from "../data/types";
import { useNav } from "../lib/nav";
import { useToast } from "../components/Toast";
import { Btn, Card, Empty, Field, IconBtn, Screen, Sheet } from "../components/ui";

export function Categories() {
  const { state } = useStore();
  const nav = useNav();
  const [edit, setEdit] = useState<Category | "new" | null>(null);

  return (
    <Screen
      title="Категории"
      subtitle="Клиенты и направления"
      onBack={nav.pop}
      right={
        <IconBtn aria-label="Новая категория" onClick={() => setEdit("new")}>
          <Plus className="h-5 w-5" strokeWidth={2} />
        </IconBtn>
      }
    >
      <div className="px-4 pb-8 pt-2">
        {state.categories.length === 0 ? (
          <Empty icon={<FolderOpen className="h-7 w-7" strokeWidth={1.5} />} title="Категорий нет" text="Создайте первую — например, имя клиента" />
        ) : (
          <Card className="divide-y divide-line">
            {state.categories.map((c) => {
              const count = state.tasks.filter((t) => t.categoryId === c.id).length;
              return (
                <button key={c.id} type="button" onClick={() => setEdit(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-soft">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{c.name}</span>
                    <span className="block truncate text-[13px] text-hint">{c.description || "Без описания"}</span>
                  </span>
                  <span className="text-[13px] tabular-nums text-hint">{count}</span>
                  <Pencil className="h-4 w-4 text-hint" strokeWidth={1.75} />
                </button>
              );
            })}
          </Card>
        )}
        <Btn variant="secondary" className="mt-4 w-full" onClick={() => setEdit("new")}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Новая категория
        </Btn>
      </div>
      {edit && <CategorySheet category={edit === "new" ? undefined : edit} onClose={() => setEdit(null)} />}
    </Screen>
  );
}

export function CategorySheet({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const { actions } = useStore();
  const toast = useToast();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

  const save = () => {
    const res = actions.saveCategory({ id: category?.id, name, description });
    if (!res.ok) return toast(res.error, "error");
    toast(category ? "Категория сохранена" : "Категория создана");
    if ("id" in res && res.id) onSaved?.(res.id);
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={category ? "Категория" : "Новая категория"}
      footer={
        <div className="flex gap-2">
          {category && (
            <Btn
              variant="danger"
              size="lg"
              onClick={() => {
                const res = actions.deleteCategory(category.id);
                if (!res.ok) return toast(res.error, "error");
                toast("Категория удалена");
                onClose();
              }}
            >
              Удалить
            </Btn>
          )}
          <Btn size="lg" className="flex-1" disabled={!name.trim()} onClick={save}>
            Сохранить
          </Btn>
        </div>
      }
    >
      <div className="space-y-3">
        <Field label="Название">
          <input autoFocus className="field" placeholder="Стоматология Smile" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Короткое описание">
          <textarea
            className="field min-h-[80px] resize-none py-3"
            placeholder="Что за клиент, какие ролики"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>
    </Sheet>
  );
}
