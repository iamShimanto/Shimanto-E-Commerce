import React from "react";
import toast from "react-hot-toast";
import { CheckCircle2, CircleAlert, TriangleAlert, X } from "lucide-react";

const styles = {
    container: {
        minWidth: "340px",
        maxWidth: "420px",
        width: "100%",
        borderRadius: "16px",
        border: "1px solid",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        boxShadow:
            "0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)",
        backdropFilter: "blur(14px)",
        transition: "all .25s ease",
    },

    iconWrap: {
        width: "42px",
        height: "42px",
        minWidth: "42px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    content: {
        flex: 1,
    },

    title: {
        margin: 0,
        fontSize: "15px",
        fontWeight: 700,
    },

    message: {
        margin: "4px 0 0",
        fontSize: "13px",
        opacity: 0.85,
        lineHeight: 1.5,
    },

    closeBtn: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.6,
        transition: "all .2s ease",
    },
};

const toastThemes = {
    success: {
        bg: "#ecfdf5",
        text: "#065f46",
        border: "#a7f3d0",
        iconBg: "#d1fae5",
        iconColor: "#059669",
        icon: CheckCircle2,
        defaultTitle: "Success",
        defaultMessage: "Action completed successfully.",
        duration: 3000,
    },

    error: {
        bg: "#fef2f2",
        text: "#991b1b",
        border: "#fecaca",
        iconBg: "#fee2e2",
        iconColor: "#dc2626",
        icon: CircleAlert,
        defaultTitle: "Error",
        defaultMessage: "Something went wrong.",
        duration: 4000,
    },

    warning: {
        bg: "#fff7ed",
        text: "#9a3412",
        border: "#fed7aa",
        iconBg: "#ffedd5",
        iconColor: "#ea580c",
        icon: TriangleAlert,
        defaultTitle: "Warning",
        defaultMessage: "Please check your input.",
        duration: 3500,
    },
};

const ToastView = ({ t, variant, title, message }) => {
    const config = toastThemes[variant];
    const Icon = config.icon;

    return (
        <div
            style={{
                ...styles.container,
                background: config.bg,
                color: config.text,
                borderColor: config.border,
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? "translateY(0)" : "translateY(-10px)",
            }}
        >
            <div
                style={{
                    ...styles.iconWrap,
                    background: config.iconBg,
                    color: config.iconColor,
                }}
            >
                <Icon size={20} />
            </div>

            <div style={styles.content}>
                <p style={styles.title}>{title}</p>
                {message && <p style={styles.message}>{message}</p>}
            </div>

            <button
                onClick={() => toast.remove(t.id)}   // FIXED
                style={{ ...styles.closeBtn, color: config.text }}
            >
                <X size={18} />
            </button>
        </div>
    );
};

export const useToast = () => {
    const showToast = ({
        variant = "success",
        title,
        message,
        duration,
    } = {}) => {
        const config = toastThemes[variant];

        toast.custom(
            (t) => (
                <ToastView
                    t={t}
                    variant={variant}
                    title={title || config.defaultTitle}
                    message={message || config.defaultMessage}
                />
            ),
            {
                duration: duration || config.duration,
            }
        );
    };

    return {
        toast: showToast,

        success: (options = {}) =>
            showToast({
                variant: "success",
                ...options,
            }),

        error: (options = {}) =>
            showToast({
                variant: "error",
                ...options,
            }),

        warning: (options = {}) =>
            showToast({
                variant: "warning",
                ...options,
            }),

        dismiss: toast.dismiss,
        remove: toast.remove,
    };
};