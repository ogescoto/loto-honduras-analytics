# Tools

> ⚠️ **Opcional / legado.** Estos scripts NO son el flujo principal del framework. La fuente de
> verdad (la bóveda) y el manual los mantiene **`doc-mapper`** en **Markdown**, sin scripts.
> Ver [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md).
>
> Puedes usar estos `.py` como **red de seguridad opcional en CI** (p. ej. detectar enlaces rotos),
> pero ni la documentación ni el manual dependen de ellos. Ajústalos al stack si decides usarlos.

| Script | Qué hace | Estado | Política relacionada |
|---|---|---|---|
| `check_obsidian_links.py` | Valida enlaces wiki rotos en `docs/` y que cada módulo tenga su nota. | opcional/legado | [`../gobernanza/Obsidian_Vault_Standard.md`](../gobernanza/Obsidian_Vault_Standard.md) |
| `generate_manual.py` | Captura pantallas de E2E anotados para el manual. | opcional/legado | [`../gobernanza/User_Manual_Standard.md`](../gobernanza/User_Manual_Standard.md) |

## Uso

```bash
# Verificar la bóveda (en CI)
python Tools/check_obsidian_links.py docs/ --src src/ --check-modules

# Generar el manual de usuario
python Tools/generate_manual.py --e2e e2e/ --out docs/manual/
```

## Integración en CI (opcional)
Si decides usarlos, pueden añadirse como gate **opcional** en el pipeline (ver [`../practicas/CI_CD.md`](../practicas/CI_CD.md)). No son obligatorios: la coherencia de la bóveda la garantiza `doc-mapper` en cada actualización.

> `generate_manual.py` incluye un gancho `capture_screenshots()` (TODO) para integrar la captura con Playwright en staging — solo relevante si quieres multimedia automático en el manual. El contenido del manual lo mantiene `doc-mapper` en Markdown.
