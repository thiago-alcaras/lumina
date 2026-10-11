import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "./api";

export const authRedirect = () =>
  Capacitor.isNativePlatform()
    ? "com.lumina.style://auth/callback"
    : location.origin + location.pathname;

export async function listenNativeAuth(
  onRecovery: () => void,
  onError: (message: string) => void,
) {
  if (!Capacitor.isNativePlatform() || !supabase) return () => {};
  const seen = new Set<string>();
  async function receive(raw: string) {
    try {
      const url = new URL(raw);
      if (
        url.protocol !== "com.lumina.style:" ||
        url.hostname !== "auth" ||
        url.pathname !== "/callback" ||
        seen.has(raw)
      )
        return;
      seen.add(raw);
      if (url.searchParams.has("error"))
        throw new Error("Não foi possível concluir o login. Tente novamente.");
      const code = url.searchParams.get("code");
      if (!code) return;
      const result = await supabase!.auth.exchangeCodeForSession(code);
      if (result.error) throw result.error;
      if (url.searchParams.get("auth") === "recovery") onRecovery();
      await Browser.close().catch(() => {});
    } catch (e) {
      onError((e as Error).message);
    }
  }
  const listener = await App.addListener(
    "appUrlOpen",
    ({ url }) => void receive(url),
  );
  const initial = await App.getLaunchUrl();
  if (initial) await receive(initial.url);
  return () => {
    void listener.remove();
  };
}

export async function socialLogin(provider: "google" | "apple") {
  const native = Capacitor.isNativePlatform();
  const result = await supabase!.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirect(), skipBrowserRedirect: native },
  });
  if (result.error) throw result.error;
  if (native && result.data.url) await Browser.open({ url: result.data.url });
}
