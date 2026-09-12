"use client";

import { useCallback, useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "amigos-theme";
export const DARK_THEME = "amigos-dark";
export const LIGHT_THEME = "amigos-light";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Day/night theme, shared by the site header and the offer calculator.
 *
 * The calculator page renders without the site header, so it needs to apply the stored
 * theme itself — otherwise `data-theme` is never set there and the night styles never
 * engage.
 */
export function useAmigosTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let stored = null;

    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // private mode or blocked storage — fall back to the light theme
    }

    const dark = stored === DARK_THEME;
    applyTheme(dark ? DARK_THEME : LIGHT_THEME);
    setIsDark(dark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      const theme = next ? DARK_THEME : LIGHT_THEME;

      applyTheme(theme);

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // the theme still applies for this session even if it cannot be persisted
      }

      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
