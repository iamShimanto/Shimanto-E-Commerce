import toast from "react-hot-toast";
import ToastCard from "../components/ui/ToastCard";

const toastStyleBase = {
  background: "transparent",
  padding: 0,
  boxShadow: "none",
};

export const useToast = () => {
  const show = (variant, title, message = "", options = {}) => {
    const defaultDuration =
      variant === "error" ? 4200 : variant === "loading" ? Infinity : 3200;
    const duration = options.duration ?? defaultDuration;

    return toast.custom(
      (t) => (
        <ToastCard
          t={t}
          variant={variant}
          title={title}
          message={message}
          duration={duration}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration,
        style: toastStyleBase,
        ...options,
      }
    );
  };

  const success = (title, message = "", options = {}) => show("success", title, message, options);

  const error = (title, message = "", options = {}) => show("error", title, message, options);

  const loading = (title, message = "", options = {}) => show("loading", title, message, options);

  const info = (title, message = "", options = {}) => show("info", title, message, options);

  const warning = (title, message = "", options = {}) => show("warning", title, message, options);

  const dismiss = (id) => toast.dismiss(id);

  const promise = (promiseValueOrPromise, msgs) => {
    const id = loading(msgs.loadingTitle || "Working...", msgs.loading || "");

    return Promise.resolve(promiseValueOrPromise)
      .then((res) => {
        dismiss(id);
        success(msgs.successTitle || "Success", msgs.success || "Done!");
        return res;
      })
      .catch((err) => {
        dismiss(id);
        error(msgs.errorTitle || "Error", msgs.error || err?.message || "Failed!");
        throw err;
      });
  };

  return { success, error, loading, info, warning, dismiss, promise };
};