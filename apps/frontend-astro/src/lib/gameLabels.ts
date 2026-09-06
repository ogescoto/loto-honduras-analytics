import type { GameType } from "@loto/shared-types";

export const GAME_LABELS: Record<GameType, string> = {
  diaria_11am:  "La Diaria 11AM",
  diaria_3pm:   "La Diaria 3PM",
  diaria_9pm:   "La Diaria 9PM",
  pega3_11am:   "Pega 3 11AM",
  pega3_3pm:    "Pega 3 3PM",
  pega3_9pm:    "Pega 3 9PM",
  premia2_11am: "Premia 2 11AM",
  premia2_3pm:  "Premia 2 3PM",
  premia2_9pm:  "Premia 2 9PM",
  juga3_11am:   "Jugá 3 11AM",
  juga3_3pm:    "Jugá 3 3PM",
  juga3_9pm:    "Jugá 3 9PM",
  super_premio: "Super Premio",
};

/** Clave de familia → label corto para botón "Todas" */
export const FAMILY_ALL_KEY: Record<string, string> = {
  all_diaria:  "Todas las jornadas",
  all_pega3:   "Todas las jornadas",
  all_premia2: "Todas las jornadas",
  all_juga3:   "Todas las jornadas",
};

/** Label legible para una clave de juego o familia (para títulos de página) */
export const SELECTION_LABELS: Record<string, string> = {
  ...GAME_LABELS,
  all_diaria:  "La Diaria — Todas las jornadas",
  all_pega3:   "Pega 3 — Todas las jornadas",
  all_premia2: "Premia 2 — Todas las jornadas",
  all_juga3:   "Jugá 3 — Todas las jornadas",
};

/**
 * Familias con sus juegos por jornada y la clave "all_*" de selección completa.
 * Super Premio no tiene jornadas múltiples → sin opción "Todas".
 */
export const GAME_FAMILIES: {
  label: string;
  familyKey?: string;      // clave para "Todas las jornadas" (undefined = sin opción)
  games: GameType[];
}[] = [
  {
    label: "La Diaria",
    familyKey: "all_diaria",
    games: ["diaria_11am", "diaria_3pm", "diaria_9pm"],
  },
  {
    label: "Pega 3",
    familyKey: "all_pega3",
    games: ["pega3_11am", "pega3_3pm", "pega3_9pm"],
  },
  {
    label: "Premia 2",
    familyKey: "all_premia2",
    games: ["premia2_11am", "premia2_3pm", "premia2_9pm"],
  },
  {
    label: "Jugá 3",
    familyKey: "all_juga3",
    games: ["juga3_11am", "juga3_3pm", "juga3_9pm"],
  },
  {
    label: "Super Premio",
    familyKey: undefined,   // un solo sorteo, sin opción "Todas"
    games: ["super_premio"],
  },
];

/** Conjunto de todos los valores de juego válidos para validación */
export const ALL_VALID_GAME_KEYS = new Set<string>([
  ...Object.keys(GAME_LABELS),
  ...Object.keys(FAMILY_ALL_KEY),
]);
