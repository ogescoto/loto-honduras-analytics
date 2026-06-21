/**
 * Extractor semántico del HTML/JSON de Loto Honduras.
 * Andamiaje: la implementación real del parsing se añadirá como tarea explícita.
 */
import type { GameType } from "@loto/shared-types";

export interface ParsedDraw {
  game: GameType;
  drawNumber: number;
  winningNumbers: number[];
  drawTimestamp: string;
}

export function parseDraws(_rawHtml: string): ParsedDraw[] {
  // TODO: implementar parsing real contra la fuente oficial (tarea pendiente).
  void _rawHtml;
  return [];
}
