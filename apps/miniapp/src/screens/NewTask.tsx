import { Link2, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { FORMATS } from "../data/config";
import { editors, editorStats, useStore } from "../data/store";
import type { Source, VideoFormat } from "../data/types";
import { DAY, formatRub, plural, toLocalInput, uid } from "../lib/format";
import { fileToVideo, isUrl } from "../lib/media";
import { useNav } from "../lib/nav";
import { useToast } from "../components/Toast";
import { CategorySheet } from "./Categories";
import { Avatar, Card, Field, GroupTitle, Screen, Segmented } from "../components/ui";

export function NewTask() {
  const { state, actions } = useStore();
  const nav = useNav();
  const toast = useToast();

  const [categoryId, setCategoryId] = useState(state.categories[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState(toLocalInput(Date.now() + 2 * DAY));
  const [format, setFormat] = useState<VideoFormat>("9:16");
  const [duration, setDuration] = useState("30–45 сек");
  const [price, setPrice] = useState(String(state.defaultPrices["9:16"]));
  const [priceTouched, setPriceTouched] = useState(false);
  const [script, setScript] = useState("");
  const [notes, setNotes] = useState("");
  const [refs, setRefs] = useState<string[]>([]);
  const [refInput, setRefInput] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newCategory, setNewCategory] = useState(false);
  const [tried, setTried] = useState(false);

  const errors = {
    categoryId: !categoryId ? "Выберите категорию" : undefined,
    title: title.trim().length < 3 ? "Название — хотя бы 3 символа" : undefined,
    assigneeId: !assigneeId ? "Кому отдаём задачу?" : undefined,
    deadline: !deadline ? "Укажите дедлайн" : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const pickFormat = (f: VideoFormat) => {
    setFormat(f);
    if (!priceTouched) setPrice(String(state.defaultPrices[f]));
  };

  const addLink = () => {
    if (!isUrl(linkInput)) return toast("Вставьте ссылку целиком, с https://", "error");
    const url = linkInput.trim();
    const name = /drive\.google/.test(url) ? "Google Drive" : /yandex|disk\.ya/.test(url) ? "Яндекс Диск" : url.replace(/^https?:\/\//, "").slice(0, 40);
    setSources((s) => [...s, { id: uid("s"), kind: "link", url, name }]);
    setLinkInput("");
  };

  const addRef = () => {
    if (!isUrl(refInput)) return toast("Вставьте ссылку целиком, с https://", "error");
    setRefs((r) => [...r, refInput.trim()]);
    setRefInput("");
  };

  const submit = () => {
    setTried(true);
    if (!valid) return toast("Заполните обязательные поля", "error");
    const res = actions.createTask({
      categoryId,
      title: title.trim(),
      assigneeId,
      deadline: new Date(deadline).getTime(),
      price: Number(price) || 0,
      brief: { script: script.trim(), notes: notes.trim(), references: refs, format, duration: duration.trim() },
      sources,
    });
    if (!res.ok) return toast(res.error, "error");
    const who = state.users.find((u) => u.id === assigneeId)?.name;
    nav.pop();
    toast(`Задача создана · ${who}у отправлено уведомление`);
  };

  return (
    <Screen title="Новая задача" onBack={nav.pop} main={{ text: "Создать задачу", onClick: submit }}>
      <div className="px-4 pb-8">
        {/* категория */}
        <GroupTitle
          action={
            <button type="button" onClick={() => setNewCategory(true)} className="inline-flex items-center gap-1 text-[13px] font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Новая
            </button>
          }
        >
          Категория
        </GroupTitle>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
          {state.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={`h-9 shrink-0 rounded-full px-3.5 text-[14px] font-medium ${categoryId === c.id ? "bg-ink text-card" : "bg-card"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {tried && errors.categoryId && <p className="mt-1 text-[12px] text-danger">{errors.categoryId}</p>}

        <div className="mt-4 space-y-3">
          <Field label="Название" error={tried ? errors.title : undefined}>
            <input className="field" placeholder="Например: Миф о коронках — часть 3" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>

        {/* монтажёр */}
        <GroupTitle>Монтажёр</GroupTitle>
        <Card className="divide-y divide-line">
          {editors(state).map((u) => {
            const st = editorStats(state, u.id);
            const active = assigneeId === u.id;
            return (
              <button key={u.id} type="button" onClick={() => setAssigneeId(u.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <Avatar user={u} size={34} />
                <span className="flex-1">
                  <span className="block text-[15px] font-medium">{u.name}</span>
                  <span className="block text-[12px] text-hint">
                    {st.active ? `в работе ${st.active} ${plural(st.active, ["задача", "задачи", "задач"])}` : "свободен"}
                  </span>
                </span>
                <span className={`h-5 w-5 rounded-full border-2 ${active ? "border-ink bg-ink shadow-[inset_0_0_0_3px_var(--app-card)]" : "border-line"}`} />
              </button>
            );
          })}
        </Card>
        {tried && errors.assigneeId && <p className="mt-1 text-[12px] text-danger">{errors.assigneeId}</p>}

        <div className="mt-4">
          <Field label="Дедлайн" error={tried ? errors.deadline : undefined}>
            <input type="datetime-local" className="field" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>
        </div>

        {/* исходники */}
        <GroupTitle>Исходники</GroupTitle>
        <Card className="p-3">
          {sources.length > 0 && (
            <ul className="mb-3 space-y-2">
              {sources.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-[12px] bg-soft p-2">
                  {s.kind === "file" ? (
                    s.poster ? (
                      <img src={s.poster} alt="" className="h-14 w-10 rounded-[8px] object-cover" />
                    ) : (
                      <video src={s.url} muted className="h-14 w-10 rounded-[8px] object-cover" />
                    )
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-card">
                      <Link2 className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[14px]">{s.name}</span>
                  <button type="button" aria-label="Убрать" onClick={() => setSources((x) => x.filter((i) => i.id !== s.id))} className="p-2 text-hint">
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-soft text-[14px] font-medium active:bg-soft-2">
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            {uploading ? "Готовим превью…" : "Загрузить видео"}
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setUploading(true);
                const v = await fileToVideo(f);
                setUploading(false);
                setSources((s) => [...s, { id: uid("s"), kind: "file", ...v }]);
              }}
            />
          </label>
          <div className="mt-2 flex gap-2">
            <input
              className="field"
              inputMode="url"
              placeholder="Ссылка на Google Drive / Яндекс Диск"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <button type="button" onClick={addLink} aria-label="Добавить ссылку" className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] bg-ink text-card">
              <Plus className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </Card>

        {/* ТЗ */}
        <GroupTitle>ТЗ</GroupTitle>
        <div className="space-y-3">
          <Field label="Сценарий">
            <textarea className="field min-h-[110px] resize-none py-3" placeholder="Текст ролика, хук, призыв" value={script} onChange={(e) => setScript(e.target.value)} />
          </Field>
          <Field label="Просьбы по монтажу">
            <textarea className="field min-h-[80px] resize-none py-3" placeholder="Субтитры, музыка, темп, графика" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-hint">Референсы</span>
            {refs.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {refs.map((r, i) => (
                  <li key={r + i} className="flex items-center gap-2 rounded-[12px] bg-card px-3 py-2 text-[14px]">
                    <Link2 className="h-4 w-4 shrink-0 text-hint" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1 truncate">{r.replace(/^https?:\/\//, "")}</span>
                    <button type="button" aria-label="Удалить" onClick={() => setRefs((x) => x.filter((_, j) => j !== i))} className="text-hint">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className="field"
                inputMode="url"
                placeholder="https://"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRef()}
              />
              <button type="button" onClick={addRef} aria-label="Добавить референс" className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] bg-card">
                <Plus className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-hint">Формат</span>
            <Segmented value={format} onChange={pickFormat} options={FORMATS.map((f) => ({ id: f, label: f }))} />
          </div>
          <Field label="Длительность">
            <input className="field" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30–45 сек" />
          </Field>
        </div>

        <GroupTitle>Оплата монтажёру</GroupTitle>
        <Field label="Цена за ролик, ₽" hint={`По умолчанию для ${format}: ${formatRub(state.defaultPrices[format])}. Можно менять, пока ролик не принят.`}>
          <input
            className="field text-[17px] font-semibold tabular-nums"
            inputMode="numeric"
            value={price}
            onChange={(e) => {
              setPriceTouched(true);
              setPrice(e.target.value.replace(/[^\d]/g, ""));
            }}
          />
        </Field>
      </div>

      {newCategory && (
        <CategorySheet onClose={() => setNewCategory(false)} onSaved={(id) => setCategoryId(id)} />
      )}
    </Screen>
  );
}
