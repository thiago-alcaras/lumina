import { authRedirect, socialLogin } from "./nativeAuth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import * as cloud from "./api";

export function Auth({
  recovery = false,
  onDone,
  onDemo,
  externalError,
}: {
  recovery?: boolean;
  onDone: () => void;
  onDemo: () => void;
  externalError: string;
}) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    recovery ? "reset" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const callback = authRedirect();
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      if (!cloud.supabase)
        throw new Error(
          "O acesso a contas reais estará disponível após configurar o Supabase. Você pode explorar a demonstração abaixo.",
        );
      await action();
    } catch (e) {
      const text = (e as Error).message;
      setMessage(
        text === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : text === "Email not confirmed"
            ? "Confirme seu e-mail antes de entrar. Você pode reenviar a confirmação abaixo."
            : text,
      );
    } finally {
      setBusy(false);
    }
  }
  function social(provider: "google" | "apple") {
    void run(async () => {
      await socialLogin(provider);
    });
  }
  return (
    <div className="auth-page">
      <div className="auth-art">
        <img src="/images/look-cozy.jpg" alt="Inspiração de estilo" />
        <div>
          <span className="brand light">✦ lumina.</span>
          <h1>
            Seu estilo.
            <br />
            Seu espaço.
            <br />
            <em>Sua história.</em>
          </h1>
          <p>Um lugar acolhedor para todos os seus jeitos de ser.</p>
        </div>
      </div>
      <div className="auth-form">
        <p className="eyebrow">QUE BOM TER VOCÊ AQUI</p>
        <h1>
          {mode === "signup"
            ? "Comece sua"
            : mode === "forgot"
              ? "Recupere seu"
              : mode === "reset"
                ? "Renove seu"
                : "Volte para seu"}{" "}
          <em>{mode === "signup" ? "história." : "espaço."}</em>
        </h1>
        <p>Uma comunidade de moda para mulheres e pessoas LGBT.</p>
        {(mode === "login" || mode === "signup") && (
          <>
            <div className="social-login">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => social("google")}
              >
                <span aria-hidden="true" className="google-mark">
                  G
                </span>{" "}
                Continuar com Google
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={() => social("apple")}
              >
                Continuar com Apple
              </button>
            </div>
            <div className="auth-divider">
              <span>ou com seu e-mail</span>
            </div>
          </>
        )}
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              if (mode === "signup") {
                const result = cloud.unwrap(
                  await cloud.supabase!.auth.signUp({
                    email,
                    password,
                    options: {
                      data: { name: name.trim() },
                      emailRedirectTo: callback,
                    },
                  }),
                );
                if (result.session) onDone();
                else
                  setMessage(
                    "Confira seu e-mail para confirmar a conta. Depois, volte para entrar.",
                  );
              } else if (mode === "forgot") {
                cloud.unwrap(
                  await cloud.supabase!.auth.resetPasswordForEmail(email, {
                    redirectTo: callback + "?auth=recovery",
                  }),
                );
                setMessage(
                  "Se houver uma conta com este e-mail, você receberá um link para criar uma nova senha.",
                );
              } else if (mode === "reset") {
                if (password !== confirmation)
                  throw new Error("As senhas precisam ser iguais.");
                cloud.unwrap(
                  await cloud.supabase!.auth.updateUser({ password }),
                );
                history.replaceState({}, "", location.pathname);
                onDone();
              } else {
                cloud.unwrap(
                  await cloud.supabase!.auth.signInWithPassword({
                    email,
                    password,
                  }),
                );
                onDone();
              }
            });
          }}
        >
          {mode === "signup" && (
            <label>
              Nome
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          )}
          {mode !== "forgot" && (
            <label>
              Senha
              <div className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}
          {mode === "reset" && (
            <label>
              Confirmar nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
              />
            </label>
          )}
          {(message || externalError) && (
            <p className="notice" role="status">
              {message || externalError}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy
              ? "Só um instante…"
              : mode === "signup"
                ? "Criar minha conta"
                : mode === "forgot"
                  ? "Enviar link de recuperação"
                  : mode === "reset"
                    ? "Salvar nova senha"
                    : "Entrar no meu espaço"}
          </button>
        </form>
        {mode === "login" && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              setMode("forgot");
              setMessage("");
            }}
          >
            Esqueci minha senha
          </button>
        )}
        {mode !== "reset" && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
            }}
          >
            {mode === "login"
              ? "Ainda não tenho conta — quero criar"
              : "Já tenho uma conta — entrar"}
          </button>
        )}
        {email && mode !== "reset" && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                cloud.unwrap(
                  await cloud.supabase!.auth.resend({
                    type: "signup",
                    email,
                    options: { emailRedirectTo: callback },
                  }),
                );
                setMessage(
                  "Se a conta estiver aguardando confirmação, enviaremos um novo e-mail.",
                );
              })
            }
          >
            Reenviar confirmação de e-mail
          </button>
        )}
        {!cloud.connected && (
          <button className="button secondary demo-entry" onClick={onDemo}>
            Explorar demonstração
          </button>
        )}
        <p className="small-text muted">
          Ao publicar, respeite a comunidade: sem discriminação, assédio ou
          exposição de outras pessoas.
        </p>
      </div>
    </div>
  );
}
