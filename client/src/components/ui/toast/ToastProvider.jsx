import React from "react";
import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={10}
            containerStyle={{
                top: 68,
                right: 10,
            }}
            toastOptions={{
                duration: 3500,
                style: {
                    background: "transparent",
                    boxShadow: "none",
                    padding: 0,
                },
            }}
        />
    );
};

export default ToastProvider;