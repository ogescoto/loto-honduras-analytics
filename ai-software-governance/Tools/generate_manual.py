#!/usr/bin/env python3
"""
generate_manual.py — Generador del manual de usuario a partir de E2E anotados.

Idea: los tests E2E (Playwright) llevan comentarios `@manual-step <texto>`.
Este script:
  1. Recorre los specs E2E y extrae, por test, su secuencia de @manual-step.
  2. (En un entorno real) ejecuta los tests en staging capturando una pantalla
     por cada paso, y guarda las imágenes en docs/manual/assets/.
  3. Ensambla una página Markdown por proceso en docs/manual/procesos/.

Estándar: ../07_Documentation/User_Manual_Standard.md
E2E:      ../06_Testing/E2E_Standards.md

NOTA: script de REFERENCIA. La captura real requiere integrarse con el runner
de Playwright (p. ej. exportando un JSON de pasos+screenshots desde un reporter
custom). Aquí se implementa la PARTE DE ENSAMBLAJE a partir de las anotaciones,
que es agnóstica del runner, y se dejan ganchos (TODO) para la captura.

Uso:
    python generate_manual.py --e2e e2e/ --out docs/manual/
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

STEP_RE = re.compile(r"//\s*@manual-step\s+(.+)")
TEST_RE = re.compile(r"""test\(\s*['"`](.+?)['"`]""")


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def parse_spec(spec: Path) -> list[dict]:
    """Extrae [{title, steps:[...]}, ...] de un archivo de test."""
    lines = spec.read_text(encoding="utf-8", errors="replace").splitlines()
    tests: list[dict] = []
    current: dict | None = None
    for line in lines:
        m_test = TEST_RE.search(line)
        if m_test:
            current = {"title": m_test.group(1), "steps": []}
            tests.append(current)
            continue
        m_step = STEP_RE.search(line)
        if m_step and current is not None:
            current["steps"].append(m_step.group(1).strip())
    return [t for t in tests if t["steps"]]


def render_process_md(test: dict, assets_rel: str = "../assets") -> str:
    """Genera el Markdown de una página de proceso."""
    out = [f"# {test['title']}\n"]
    out.append("## Descripción\n")
    out.append(f"Guía paso a paso para: {test['title'].lower()}.\n")
    out.append("## Pasos\n")
    for i, step in enumerate(test["steps"], start=1):
        shot = f"{slugify(test['title'])}-{i}.png"
        out.append(f"{i}. {step}")
        out.append(f"   ![Paso {i}]({assets_rel}/{shot})\n")
    out.append("## Resultado esperado\n")
    out.append("El último paso confirma que la tarea se completó correctamente.\n")
    return "\n".join(out)


def capture_screenshots(test: dict, assets_dir: Path) -> None:
    """TODO: integrar con Playwright para ejecutar el test en staging y
    capturar una imagen por @manual-step en assets_dir.
    Por ahora es un gancho no-op."""
    pass  # placeholder de referencia


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera el manual de usuario.")
    parser.add_argument("--e2e", type=Path, required=True, help="Carpeta de tests E2E")
    parser.add_argument("--out", type=Path, required=True, help="Carpeta docs/manual/")
    args = parser.parse_args()

    procesos_dir = args.out / "procesos"
    assets_dir = args.out / "assets"
    procesos_dir.mkdir(parents=True, exist_ok=True)
    assets_dir.mkdir(parents=True, exist_ok=True)

    specs = list(args.e2e.rglob("*.spec.ts")) + list(args.e2e.rglob("*.spec.js"))
    total = 0
    for spec in specs:
        for test in parse_spec(spec):
            capture_screenshots(test, assets_dir)  # TODO real
            page = procesos_dir / f"{slugify(test['title'])}.md"
            page.write_text(render_process_md(test), encoding="utf-8")
            total += 1
            print(f"  + {page}")

    print(f"✅ Manual generado: {total} proceso(s) en {procesos_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
