import { useState, useRef } from "react";
import {
  Button,
  Card,
  Typography,
  Field,
  Empty,
  errorMessage,
  type FeatureProps,
} from "./Shared";
import { readImage } from "../services/imageService";
import { safeImage } from "../services/persistenceService";
import { generateVisionBoardImage } from "../services/geminiService";
import type { Outfit, VisionItem } from "../types";
export default function ImageCollection({
  mode,
  data,
  setData,
  t,
  notify,
}: FeatureProps & { mode: "registry" | "vision" }) {
  const isLook = mode === "registry";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState<Outfit["category"]>("casual");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const reset = () => {
    setOpen(false);
    setEditing(null);
    setName("");
    setImage("");
    setCategory("casual");
    if (fileInput.current) fileInput.current.value = "";
  };
  const save = (source: string) => {
    if (!name.trim()) return;
    if (!safeImage(source)) {
      notify(t.ui.image_error);
      return;
    }
    const id = editing ?? crypto.randomUUID();
    if (isLook) {
      const outfit: Outfit = {
        id,
        name: name.trim(),
        image: source,
        category,
        dateAdded:
          data.outfits.find((v) => v.id === id)?.dateAdded ??
          new Date().toISOString(),
      };
      setData((d) => ({
        ...d,
        outfits: editing
          ? d.outfits.map((v) => (v.id === id ? outfit : v))
          : [outfit, ...d.outfits],
      }));
    } else {
      const item: VisionItem = {
        id,
        prompt: name.trim(),
        imageUrl: source,
        category: "manifestation",
      };
      setData((d) => ({
        ...d,
        vision: editing
          ? d.vision.map((v) => (v.id === id ? item : v))
          : [item, ...d.vision],
      }));
    }
    reset();
  };
  const images = isLook
    ? data.outfits
        .filter((v) => filter === "all" || v.category === filter)
        .map((v) => ({
          id: v.id,
          title: v.name,
          image: v.image,
          category: v.category,
        }))
    : data.vision.map((v) => ({
        id: v.id,
        title: v.prompt,
        image: v.imageUrl,
        category: v.category,
      }));
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Typography variant="h2">
            {isLook ? t.registry.title : t.vision.title}
          </Typography>
          <Typography>
            {isLook ? t.registry.subtitle : t.vision.subtitle}
          </Typography>
        </div>
        <Button
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          {isLook ? t.registry.add_look : t.ui.new_vision}
        </Button>
      </div>
      {isLook && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(t.registry.categories).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "primary" : "outline"}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
      {open && (
        <Card>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save(image);
            }}
          >
            <Typography variant="h3">
              {editing ? t.ui.edit : isLook ? t.ui.new_look : t.ui.new_vision}
            </Typography>
            <Field label={isLook ? t.ui.name : t.ui.description}>
              <input
                required
                maxLength={1000}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
              />
            </Field>
            {isLook && (
              <Field label={t.ui.category}>
                <select
                  disabled={busy}
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as Outfit["category"])
                  }
                >
                  {Object.entries(t.registry.categories)
                    .filter(([k]) => k !== "all")
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <Field label={t.ui.image}>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  try {
                    setImage(await readImage(file));
                  } catch (error) {
                    notify(errorMessage(error, t));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </Field>
            <Field label={t.ui.imageUrl}>
              <input
                type="url"
                value={image.startsWith("data:") ? "" : image}
                onChange={(e) => setImage(e.target.value)}
                disabled={busy}
              />
            </Field>
            {image && (
              <img
                src={image}
                alt={name}
                className="h-40 max-w-full rounded-xl object-cover"
              />
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={busy || !image || !name.trim()}>
                {t.ui.save}
              </Button>
              {!isLook && (
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={busy}
                  disabled={!name.trim()}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      save(await generateVisionBoardImage(name.trim()));
                    } catch (error) {
                      notify(errorMessage(error, t));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {t.ui.ai}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={reset}
              >
                {t.ui.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}
      {images.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {images.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover bg-lumina-100"
              />
              <div className="p-4 space-y-3">
                <Typography variant="h3" className="!text-lg break-words">
                  {item.title}
                </Typography>
                {isLook && (
                  <Typography variant="small">
                    {t.registry.categories[item.category as Outfit["category"]]}
                  </Typography>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      setEditing(item.id);
                      setName(item.title);
                      setImage(item.image);
                      if (isLook)
                        setCategory(item.category as Outfit["category"]);
                      setOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {t.ui.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      if (confirm(t.ui.confirm_delete)) {
                        setData((d) =>
                          isLook
                            ? {
                                ...d,
                                outfits: d.outfits.filter(
                                  (v) => v.id !== item.id,
                                ),
                              }
                            : {
                                ...d,
                                vision: d.vision.filter(
                                  (v) => v.id !== item.id,
                                ),
                              },
                        );
                        if (editing === item.id) reset();
                      }
                    }}
                  >
                    {t.ui.delete}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty text={t.ui.empty} />
      )}
    </div>
  );
}
