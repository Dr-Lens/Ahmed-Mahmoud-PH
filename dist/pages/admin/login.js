import { h, mount } from "../../utils/dom.js";
import { login } from "../../api/auth.js";
import { navigate } from "../../services/router.js";
import { setMeta } from "../../services/meta.js";
export function renderAdminLogin(outlet) {
    setMeta({ title: "تسجيل الدخول — أحمد محمود PH", description: "تسجيل دخول لوحة التحكم." });
    const error = h("p", { class: "admin-login__error", role: "alert" });
    const userInput = h("input", { class: "input", type: "text", name: "username", autocomplete: "username", required: "true" });
    const passInput = h("input", { class: "input", type: "password", name: "password", autocomplete: "current-password", required: "true" });
    const submitBtn = h("button", { class: "btn btn--primary", type: "submit" }, ["تسجيل الدخول"]);
    const form = h("form", { class: "admin-login__form" }, [
        h("label", { class: "field" }, [h("span", { class: "field__label" }, ["اسم المستخدم"]), userInput]),
        h("label", { class: "field" }, [h("span", { class: "field__label" }, ["كلمة المرور"]), passInput]),
        error,
        submitBtn,
    ]);
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        error.textContent = "";
        submitBtn.setAttribute("disabled", "true");
        submitBtn.textContent = "جارٍ تسجيل الدخول\u2026";
        try {
            await login(userInput.value.trim(), passInput.value);
            navigate("/admin", true);
        }
        catch (err) {
            error.textContent = err instanceof Error ? err.message : "اسم المستخدم أو كلمة المرور غير صحيحة.";
        }
        finally {
            submitBtn.removeAttribute("disabled");
            submitBtn.textContent = "تسجيل الدخول";
        }
    });
    const page = h("div", { class: "admin admin-login" }, [
        h("p", { class: "admin-login__brand" }, ["أحمد محمود PH"]),
        h("h1", { class: "admin-login__title" }, ["تسجيل دخول لوحة التحكم"]),
        form,
    ]);
    mount(outlet, page);
    userInput.focus();
}
