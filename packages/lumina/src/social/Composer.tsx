import { useState } from "react";
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  ScanLine,
  Check,
  Link2,
} from "lucide-react";
import { Modal } from "./ui";
import { moods } from "./data";
import { preparePhoto, fingerprint, cropPhoto, safeLink, uid } from "./storage";
import { analyze, connected } from "./api";
import type { Mood, Piece, Post, Person, Story } from "./types";
type Draft = Piece & {
  existingId?: string;
  confidence?: number;
  cropBox?: number[];
};
export function Composer({
  type,
  wardrobe,
  profile,
  onClose,
  onSubmit,
  onError,
}: {
  type: "look" | "piece" | "story";
  wardrobe: Piece[];
  profile: Person;
  onClose: () => void;
  onSubmit: (value: {
    post?: Post;
    pieces: Piece[];
    story?: Story;
    date?: string;
  }) => Promise<void>;
  onError: (s: string) => void;
}) {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState<Mood>("Cozy");
  const [date, setDate] = useState("");
  const [items, setItems] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [cropBox, setCropBox] = useState([0, 0, 1000, 1000]);
  async function detect(photo: string) {
    setBusy(true);
    setMessage("Identificando peças e comparando com seu guarda-roupa…");
    try {
      const detections = await analyze(photo);
      const drafts = await Promise.all(
        detections.map(async (d) => {
          const crop = await cropPhoto(photo, d.bbox);
          return {
            id: uid(),
            name: d.name,
            category: d.category,
            color: d.color,
            brand: d.brand || "",
            link: "",
            image: crop,
            fingerprint: await fingerprint(crop),
            existingId: d.existingId || undefined,
            confidence: d.confidence,
          };
        }),
      );
      setItems(drafts);
      setMessage(
        drafts.length
          ? "Confira as peças e os possíveis matches antes de salvar."
          : "Nenhuma peça identificada. Você pode cadastrar manualmente.",
      );
    } catch (e) {
      setMessage(
        "O reconhecimento não concluiu. Cadastre manualmente ou tente novamente.",
      );
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function select(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const photo = await preparePhoto(file);
      setImage(photo);
      setItems([]);
      const hash = await fingerprint(photo);
      const existing = wardrobe.find((p) => p.fingerprint === hash);
      if (existing && type === "piece") {
        setItems([{ ...existing, existingId: existing.id }]);
        setMessage(
          "Esta mesma foto já está cadastrada. A peça existente será reutilizada.",
        );
      } else if (type !== "story" && connected) {
        await detect(photo);
      } else {
        setMessage(
          type === "story"
            ? "Seu story ficará disponível por 24 horas."
            : "IA disponível ao conectar uma conta e o servidor. Aqui, cadastre as peças manualmente.",
        );
        if (type === "piece")
          setItems([
            {
              id: uid(),
              name: "",
              category: "Blusa",
              color: "",
              brand: "",
              link: "",
              image: photo,
              fingerprint: hash,
            },
          ]);
      }
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function edit(index: number, patch: Partial<Draft>) {
    setItems((old) =>
      old.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) return onError("Escolha uma foto primeiro.");
    const newItems = items.filter((p) => !p.existingId);
    if (new Set(newItems.map((p) => p.fingerprint)).size !== newItems.length)
      return onError(
        "Recorte cada peça separadamente ou remova a foto repetida.",
      );
    if (items.some((p) => !p.name.trim() && !p.existingId))
      return onError("Dê um nome a cada peça.");
    if (items.some((p) => p.link && !safeLink(p.link)))
      return onError("Use links completos começando com https://.");
    setSaving(true);
    try {
      const resolved = items.map((p) =>
        p.existingId ? wardrobe.find((w) => w.id === p.existingId)! : p,
      );
      if (resolved.some((p) => !p))
        throw new Error(
          "Uma peça vinculada não existe mais. Revise o cadastro.",
        );
      const now = new Date().toISOString();
      await onSubmit({
        pieces: resolved,
        post:
          type === "look"
            ? {
                id: uid(),
                author: profile,
                title: title.trim(),
                description: description.trim(),
                mood,
                image,
                pieces: resolved,
                likes: 0,
                createdAt: now,
              }
            : undefined,
        story:
          type === "story"
            ? {
                id: uid(),
                author: profile,
                title: title.trim(),
                image,
                expiresAt: new Date(Date.now() + 86400000).toISOString(),
              }
            : undefined,
        date: date || undefined,
      });
      onClose();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      title={
        type === "look"
          ? "Um look, uma história"
          : type === "piece"
            ? "Nova peça no seu guarda-roupa"
            : "Seu momento de hoje"
      }
      onClose={saving ? () => {} : onClose}
      wide
    >
      <form onSubmit={submit} className="composer">
        <div className="composer-photo">
          {image ? (
            <img src={image} alt="Sua foto selecionada" />
          ) : (
            <div className="upload-placeholder">
              <Camera size={38} />
              <h3>Mostre seu jeito de vestir.</h3>
              <p>JPG, PNG ou WebP · até 12 MB</p>
            </div>
          )}
          <div className="upload-actions">
            <label className="button secondary">
              <Upload size={16} /> Escolher foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy || saving}
                onChange={(e) => select(e.target.files?.[0])}
              />
            </label>
            <label className="button secondary">
              <Camera size={16} /> Câmera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={busy || saving}
                onChange={(e) => select(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
        <div className="composer-fields">
          {type !== "piece" && (
            <>
              <label>
                Título
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Como esse look faz você se sentir?"
                />
              </label>
              {type === "look" && (
                <>
                  <label>
                    Sua história
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1500}
                      placeholder="Conte sobre as peças, a ocasião, você…"
                    />
                  </label>
                  <label>
                    Mood
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value as Mood)}
                    >
                      {moods.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Registrar no calendário <small>opcional</small>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>
                </>
              )}
            </>
          )}
          {message && (
            <p className="notice" role="status">
              {busy ? (
                <span className="spinner small" />
              ) : (
                <ScanLine size={18} />
              )}{" "}
              {message}
            </p>
          )}
          {type !== "story" && image && (
            <>
              <div className="section-line">
                <h3>Peças do look</h3>
                {connected && (
                  <button
                    disabled={busy || saving}
                    type="button"
                    className="text-button"
                    onClick={() => detect(image)}
                  >
                    Analisar foto
                  </button>
                )}
              </div>
              {items.map((p, i) => (
                <div className="piece-editor" key={p.id}>
                  <div className="piece-editor-top">
                    <img src={p.image} alt="Recorte da peça" />
                    <div>
                      <strong>Peça {i + 1}</strong>
                      {p.confidence !== undefined && (
                        <small>
                          Match sugerido: {Math.round(p.confidence * 100)}% ·
                          revise
                        </small>
                      )}
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Remover peça"
                      onClick={() => setItems(items.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <label>
                    Já tenho esta peça
                    <select
                      aria-label="Já tenho esta peça"
                      value={p.existingId || ""}
                      onChange={(e) =>
                        edit(i, { existingId: e.target.value || undefined })
                      }
                    >
                      <option value="">É uma peça nova</option>
                      {wardrobe.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} · {w.color}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!p.existingId && (
                    <>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          setCropIndex(i);
                          setCropBox(p.cropBox || [0, 0, 1000, 1000]);
                        }}
                      >
                        Recortar esta peça
                      </button>
                      {cropIndex === i && (
                        <div className="crop-editor">
                          <div className="crop-preview">
                            <img src={image} alt="Foto para recortar" />
                            <span
                              style={{
                                top: cropBox[0] / 10 + "%",
                                left: cropBox[1] / 10 + "%",
                                height: (cropBox[2] - cropBox[0]) / 10 + "%",
                                width: (cropBox[3] - cropBox[1]) / 10 + "%",
                              }}
                            />
                          </div>
                          {["Topo", "Esquerda", "Base", "Direita"].map(
                            (edge, j) => (
                              <label key={edge}>
                                {edge}: {Math.round(cropBox[j] / 10)}%
                                <input
                                  type="range"
                                  min="0"
                                  max="1000"
                                  step="10"
                                  value={cropBox[j]}
                                  onChange={(e) =>
                                    setCropBox((box) =>
                                      box.map((n, k) =>
                                        k === j ? Number(e.target.value) : n,
                                      ),
                                    )
                                  }
                                />
                              </label>
                            ),
                          )}
                          <button
                            type="button"
                            className="button secondary"
                            disabled={
                              busy ||
                              cropBox[2] <= cropBox[0] ||
                              cropBox[3] <= cropBox[1]
                            }
                            onClick={async () => {
                              setBusy(true);
                              try {
                                const cropped = await cropPhoto(image, cropBox);
                                edit(i, {
                                  image: cropped,
                                  fingerprint: await fingerprint(cropped),
                                  cropBox,
                                });
                                setCropIndex(null);
                              } catch (e) {
                                onError((e as Error).message);
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            Aplicar recorte
                          </button>
                        </div>
                      )}
                      <label>
                        Nome
                        <input
                          required
                          value={p.name}
                          maxLength={100}
                          onChange={(e) => edit(i, { name: e.target.value })}
                          placeholder="Ex.: cardigã de tricô"
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Categoria
                          <select
                            value={p.category}
                            onChange={(e) =>
                              edit(i, { category: e.target.value })
                            }
                          >
                            {[
                              "Blusa",
                              "Tricô",
                              "Calça",
                              "Saia",
                              "Vestido",
                              "Casaco",
                              "Sapato",
                              "Acessório",
                              "Outro",
                            ].map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Cor
                          <input
                            value={p.color}
                            maxLength={50}
                            onChange={(e) => edit(i, { color: e.target.value })}
                          />
                        </label>
                      </div>
                      <label>
                        Marca <small>opcional</small>
                        <input
                          value={p.brand}
                          maxLength={100}
                          onChange={(e) => edit(i, { brand: e.target.value })}
                        />
                      </label>
                      <label>
                        <Link2 size={13} /> Link de compra
                        <input
                          type="url"
                          value={p.link}
                          onChange={(e) => edit(i, { link: e.target.value })}
                          placeholder="https://loja.com/peca"
                        />
                      </label>
                    </>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="button secondary full"
                disabled={busy || saving}
                onClick={async () =>
                  setItems([
                    ...items,
                    {
                      id: uid(),
                      name: "",
                      category: "Blusa",
                      color: "",
                      brand: "",
                      link: "",
                      image,
                      fingerprint: await fingerprint(image),
                    },
                  ])
                }
              >
                <Plus size={16} /> Cadastrar peça manualmente
              </button>
            </>
          )}
          <p className="muted small-text">
            {type === "piece"
              ? "Suas peças são privadas."
              : type === "story"
                ? "Stories são visíveis para a comunidade por 24 horas."
                : "Seu look será público. As peças vinculadas a ele também."}
          </p>
          <button
            className="button primary full"
            disabled={
              !image || busy || saving || (type === "piece" && !items.length)
            }
          >
            {saving ? <span className="spinner small" /> : <Check size={17} />}{" "}
            {saving
              ? "Salvando…"
              : type === "piece"
                ? "Salvar peça"
                : type === "story"
                  ? "Publicar story"
                  : "Compartilhar look"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
