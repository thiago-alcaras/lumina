import { useState } from "react";
import type { Person } from "./types";
import { supabase, unwrap } from "./api";
export function Onboarding({
  profile,
  onDone,
}: {
  profile: Person;
  onDone: (profile: Person) => void;
}) {
  const [name, setName] = useState(
    profile.name === "Meu estilo" ? "" : profile.name,
  );
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="auth-page">
      <div className="auth-art">
        <img src="/images/look-romantic.jpg" alt="" />
        <div>
          <span className="brand light">✦ lumina.</span>
          <h1>
            Seu próximo
            <br />
            <em>capítulo.</em>
          </h1>
        </div>
      </div>
      <div className="auth-form">
        <p className="eyebrow">SEU ESPAÇO ESTÁ QUASE PRONTO</p>
        <h1>
          Como podemos <em>te chamar?</em>
        </h1>
        <p>Escolha seu nome e um @ para as pessoas encontrarem seu estilo.</p>
        <form
          className="stack-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const updated = {
                ...profile,
                name: name.trim(),
                handle: handle.toLowerCase(),
              };
              unwrap(
                await supabase!
                  .from("profiles")
                  .update({ name: updated.name, handle: updated.handle })
                  .eq("id", profile.id)
                  .select("id")
                  .single(),
              );
              onDone(updated);
            } catch (e) {
              setError(
                (e as Error).message.includes("duplicate")
                  ? "Este @ já está em uso. Experimente outro."
                  : (e as Error).message,
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Nome
            <input
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              pattern=".*\S.*"
            />
          </label>
          <label>
            @usuário
            <input
              value={handle}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              required
              pattern="[a-z0-9_]{3,24}"
              minLength={3}
              maxLength={24}
            />
          </label>
          <p className="small-text muted">
            Use de 3 a 24 letras, números ou sublinhado.
          </p>
          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy ? "Salvando…" : "Entrar na comunidade"}
          </button>
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={async () => {
              const result = await supabase!.auth.signOut();
              if (result.error) setError(result.error.message);
            }}
          >
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  );
}
