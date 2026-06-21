#!/usr/bin/env python3
"""
check_obsidian_links.py — Verificador de la bóveda Obsidian.

Valida dos cosas en la carpeta docs/ de un proyecto:
  1. Que no haya enlaces wiki rotos: [[ruta/Nota|Alias]] cuyo destino no exista.
  2. (Opcional) Que cada módulo en src/ tenga su nota en docs/04_Modulos/.

Pensado para ejecutarse en CI (ver ../08_DevOps/CI_CD.md). Devuelve código de
salida != 0 si encuentra problemas.

NOTA: script de REFERENCIA. Ajusta las rutas y reglas al stack del proyecto.

Uso:
    python check_obsidian_links.py docs/
    python check_obsidian_links.py docs/ --src src/ --check-modules
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]")


def find_markdown_files(vault: Path) -> list[Path]:
    return list(vault.rglob("*.md"))


def resolve_target(vault: Path, link: str) -> bool:
    """Un enlace [[X]] es válido si existe X.md en cualquier parte de la bóveda
    o como ruta relativa desde la raíz de la bóveda."""
    link = link.strip()
    candidates = [
        vault / f"{link}.md",
        vault / link,
    ]
    if any(c.exists() for c in candidates):
        return True
    # Coincidencia por nombre de nota (Obsidian resuelve por basename)
    basename = Path(link).name
    return any(p.stem == basename for p in vault.rglob("*.md"))


def check_links(vault: Path) -> list[str]:
    errors: list[str] = []
    for md in find_markdown_files(vault):
        text = md.read_text(encoding="utf-8", errors="replace")
        for match in WIKILINK_RE.finditer(text):
            target = match.group(1)
            if not resolve_target(vault, target):
                errors.append(f"{md}: enlace roto -> [[{target}]]")
    return errors


def check_modules(vault: Path, src: Path) -> list[str]:
    """Cada subcarpeta de src/ con MODULE.yaml debe tener nota en 04_Modulos/."""
    errors: list[str] = []
    modulos_dir = vault / "04_Modulos"
    notes = {p.stem.lower() for p in modulos_dir.rglob("*.md")} if modulos_dir.exists() else set()
    for manifest in src.rglob("MODULE.yaml"):
        module_name = manifest.parent.name.lower()
        if not any(module_name in n or n in module_name for n in notes):
            errors.append(
                f"Módulo '{manifest.parent}' sin nota en docs/04_Modulos/"
            )
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Verifica la bóveda Obsidian.")
    parser.add_argument("vault", type=Path, help="Ruta a la carpeta docs/")
    parser.add_argument("--src", type=Path, default=None, help="Ruta a src/ del proyecto")
    parser.add_argument("--check-modules", action="store_true",
                        help="Verificar que cada módulo tenga su nota")
    args = parser.parse_args()

    if not args.vault.exists():
        print(f"ERROR: no existe la bóveda: {args.vault}", file=sys.stderr)
        return 2

    errors = check_links(args.vault)
    if args.check_modules and args.src:
        errors += check_modules(args.vault, args.src)

    if errors:
        print("❌ Problemas encontrados en la bóveda:")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("✅ Bóveda OK: sin enlaces rotos ni módulos sin documentar.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
