"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
	children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
	return React.createElement(
		NextThemesProvider,
		{
			attribute: "class",
			defaultTheme: "system",
			enableSystem: true,
			disableTransitionOnChange: true,
			enableColorScheme: true,
			storageKey: "shimanto-theme",
		},
		children,
	);
}
