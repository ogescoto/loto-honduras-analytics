# Receta: proteger la rama `main` de forma reproducible

Aplica las reglas de protección de [`../../08_DevOps/Git_GitHub_Standards.md`](../../08_DevOps/Git_GitHub_Standards.md)
con `gh api`, **una vez por proyecto**. No configures la protección a mano por la UI: esta
receta es repetible y versionable.

## Requisitos
- `gh` autenticado con permisos de admin sobre el repo (`gh auth status`).
- Reemplaza `OWNER/REPO` y el nombre del check requerido (`quality`) por los de tu proyecto.

## Comando (Bash / Git Bash)

```bash
OWNER_REPO="OWNER/REPO"   # p.ej. ogescoto/mi-proyecto

gh api -X PUT "repos/${OWNER_REPO}/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["quality", "e2e"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "required_linear_history": true,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
JSON
```

## Ajustes recomendados aparte (también con `gh` o por la UI)
- **Auto-borrado de ramas** tras el merge:
  ```bash
  gh repo edit "${OWNER_REPO}" --delete-branch-on-merge
  ```
- **Permitir solo squash merge** (deshabilitar merge commit y rebase) para garantizar 1 PR =
  1 commit, en *Settings → General → Pull Requests*:
  ```bash
  gh api -X PATCH "repos/${OWNER_REPO}" \
    -F allow_squash_merge=true \
    -F allow_merge_commit=false \
    -F allow_rebase_merge=false
  ```
- **Require signed commits** (opcional, recomendado):
  ```bash
  gh api -X POST "repos/${OWNER_REPO}/branches/main/protection/required_signatures"
  ```

## Verificar
```bash
gh api "repos/${OWNER_REPO}/branches/main/protection" | jq '.required_linear_history, .allow_force_pushes'
```
Debe devolver `{ "enabled": true }` y `{ "enabled": false }` respectivamente.
