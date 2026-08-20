import { h, mount } from "../../utils/dom.js";
import { login } from "../../api/auth.js";
import { navigate } from "../../services/router.js";
import { setMeta } from "../../services/meta.js";

export function renderAdminLogin(outlet: HTMLElement): void {
  setMeta({ title: "Admin — AHMED MAHMOUD PH", description: "Admin sign in." });

  const error = h("p", { class: "admin-login__error", role: "alert" });
  const userInput = h("input", { class: "input", type: "text", name: "username", autocomplete: "username", required: "true" }) as HTMLInputElement;
  const passInput = h("input", { class: "input", type: "password", name: "password", autocomplete: "current-password", required: "true" }) as HTMLInputElement;
  const submitBtn = h("button", { class: "btn btn--primary", type: "submit" }, ["Sign in"]);

  const form = h("form", { class: "admin-login__form" }, [
    h("label", { class: "field" }, [h("span", { class: "field__label" }, ["Username"]), userInput]),
    h("label", { class: "field" }, [h("span", { class: "field__label" }, ["Password"]), passInput]),
    error,
    submitBtn,
  ]);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.textContent = "";
    submitBtn.setAttribute("disabled", "true");
    submitBtn.textContent = "Signing in\u2026";
    try {
      await login(userInput.value.trim(), passInput.value);
      navigate("/admin", true);
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : "Invalid username or password.";
    } finally {
      submitBtn.removeAttribute("disabled");
      submitBtn.textContent = "Sign in";
    }
  });

  const page = h("div", { class: "admin admin-login" }, [
    h("p", { class: "admin-login__brand" }, ["AHMED MAHMOUD PH"]),
    h("h1", { class: "admin-login__title" }, ["Admin sign in"]),
    form,
  ]);
  mount(outlet, page);
  userInput.focus();
}
