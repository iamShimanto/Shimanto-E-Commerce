"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
	return React.createElement(Toaster, {
		position: "top-right",
		gutter: 12,
		reverseOrder: false,
		toastOptions: {
			duration: 4500,
			style: {
				background: "transparent",
				boxShadow: "none",
				padding: 0,
				margin: 0,
			},
		},
	});
}
