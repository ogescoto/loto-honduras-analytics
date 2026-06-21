# Tools

> ⚠️ **Opcional / legado.** Estos scripts NO son el flujo principal del framework. La fuente de
> verdad (la bóveda) y el manual los mantiene el **Experto Obsidian** (`/obsidian`) en **Markdown**,
> sin scripts. Ver [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md).
>
> Puedes usar estos `.py` como **red de seguridad opcional en CI** (p. ej. detectar enlaces rotos),
> pero ni la documentación ni el manual dependen de ellos. Ajústalos al stack si decides usarlos.

| Script | Qué hace | Estado | Política relacionada |
|---|---|---|---|
| `check_obsidian_links.py` | Valida enlaces wiki rotos en `docs/` y que cada módulo tenga su nota. | opcional/legado | [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md) |
| `generate_manual.py` | Captura pantallas de E2E anotados para el manual. | opcional/legado | [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md) |

## Uso

```bash
# Verificar la bóveda (en CI)
python Tools/check_obsidian_links.py docs/ --src src/ --check-modules

# Generar el manual de usuario
python Tools/generate_manual.py --e2e e2e/ --out docs/manual/
```

## Integración en CI (opcional)
Si decides usarlos, pueden añadirse como gate **opcional** en el pipeline (ver [`../08_DevOps/CI_CD.md`](../08_DevOps/CI_CD.md)). No son obligatorios: la coherencia de la bóveda la garantiza el Experto Obsidian en cada actualización.

> `generate_manual.py` incluye un gancho `capture_screenshots()` (TODO) para integrar la captura con Playwright en staging — solo relevante si quieres multimedia automático en el manual. El contenido del manual lo mantiene `/obsidian` en Markdown.
