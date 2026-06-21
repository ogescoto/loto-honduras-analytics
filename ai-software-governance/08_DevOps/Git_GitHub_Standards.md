---
obligation: standard
area: devops
applies_to: all projects
---

# Estándares de Git y GitHub

## Propósito
Que el uso de Git/GitHub sea una **práctica reproducible y trazable**, no una improvisación.
Define el flujo de ramas, commits, PRs, merge, protección de ramas, releases y la higiene del
repositorio, de modo que el historial sea legible, revisable y seguro — incluido el trabajo
hecho por agentes de IA.

> La **nomenclatura** de ramas y commits vive en
> [`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md). Este
> documento es la fuente canónica del **flujo de trabajo** con Git/GitHub; no duplica la
> nomenclatura, la enlaza.

---

## Modelo de ramas — Trunk-based / GitHub Flow

`main` es la única rama de larga vida y **siempre está desplegable**.

- **`main` protegida y desplegable.** Nada se commitea directamente; todo entra por PR.
- **Ramas cortas y efímeras** con la convención `tipo/descripcion-corta`
  (`feat/payment-refunds`, `fix/login-timeout`). Una rama = **una unidad de trabajo**.
- **Vida corta.** Se abren desde `main`, se mergean pronto y **se borran tras el merge**.
- **Sin ramas de larga vida** (`develop`, `release/*` permanentes). Un **hotfix** es una rama
  corta `fix/...` desde `main`.

```
main ───●────────●────────●───────►  (siempre desplegable)
         \        \        \
          feat/…   fix/…    feat/…    (ramas cortas, se borran tras merge)
```

> Modelo elegido por el framework: simple, encaja con CI por PR y previews por PR
> (ver [`CI_CD.md`](CI_CD.md)). Si un proyecto necesita Git Flow (releases formales con ventanas
> largas), debe registrarlo como excepción ([`../00_Governance/Exceptions_Process.md`](../00_Governance/Exceptions_Process.md)).

---

## Commits — Conventional Commits

- Formato [Conventional Commits](https://www.conventionalcommits.org/):
  `tipo(scope): resumen en imperativo` → `feat(payments): add refund use case`.
- Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`
  (ver [`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md)).
- **Commits atómicos:** un commit = un cambio coherente. Ni "WIP", ni "varios arreglos".
- Mensaje en **imperativo** ("add", "fix"), no en pasado ("added", "fixed").
- Cuando el commit lo genera un agente de IA, añade el *trailer*:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```

---

## Pull Requests

- **Todo cambio entra por PR.** Nada directo a `main`.
- **PR pequeño y enfocado** (una intención). Si crece demasiado, divídelo.
- Usa la plantilla [`../Templates/Pull_Request_Template.md`](../Templates/Pull_Request_Template.md)
  (destino en el proyecto: `.github/pull_request_template.md`).
- Se valida contra [`../Checklists/PR_Review.md`](../Checklists/PR_Review.md).
- **Requisitos para mergear:** ≥1 review aprobado **y** CI verde (todos los gates de
  [`CI_CD.md`](CI_CD.md)).
- El **título del PR** debe ser un Conventional Commit válido: será el mensaje del commit squash.

---

## Política de merge — Squash + historia lineal

- **Squash-and-merge obligatorio.** Cada PR se colapsa en **un único commit** sobre `main`.
  Resultado: historia limpia donde *1 commit = 1 PR = 1 unidad de trabajo*.
- **Historia lineal** (linear history activada). **Prohibido** el merge commit y el
  **force-push a `main`**.
- El commit squash usa el **título del PR** (Conventional) → habilita changelog automático por
  commits.
- La rama se **borra automáticamente** tras el merge.

> No se reescribe historia ya publicada en `main`. El rebase es válido **en tu rama** antes de
> abrir/actualizar el PR, nunca sobre `main`.

---

## Protección de ramas (branch protection)

Reglas mínimas obligatorias sobre `main`:

| Regla | Valor |
|---|---|
| Require pull request before merging | ✅ (≥1 approval) |
| Dismiss stale approvals on new commits | ✅ |
| Require status checks to pass | ✅ (los gates de [`CI_CD.md`](CI_CD.md)) |
| Require branches up to date before merge | ✅ |
| Require linear history | ✅ |
| Require conversation resolution | ✅ |
| Allow force pushes | ❌ |
| Allow deletions | ❌ |
| Require signed commits | ⚠️ recomendado (opcional) |
| Include administrators | ✅ (aplica también a admins) |

Se configura una sola vez por proyecto, de forma **reproducible** con `gh api` (ver la receta
en [`../Templates/github/branch-protection.md`](../Templates/github/branch-protection.md)), no a
mano por la UI.

---

## CODEOWNERS y módulos protegidos

Los **módulos protegidos** declarados en `.aicodeprotect.yml`
(ver [`../09_AI/Protected_Modules.md`](../09_AI/Protected_Modules.md)) deben tener un **owner**
en `.github/CODEOWNERS`. Así, todo PR que los toque **exige review del owner humano** antes del
merge — refuerzo técnico de la regla "la IA no toca zonas protegidas sin aprobación".

Plantilla: [`../Templates/github/CODEOWNERS`](../Templates/github/CODEOWNERS).

---

## Releases y tags (SemVer del proyecto)

- Versionado [SemVer](https://semver.org/lang/es/): tags `vMAJOR.MINOR.PATCH` (`v1.4.0`).
- Cada release = **tag** + **GitHub Release** con notas (derivadas del `CHANGELOG.md` del
  proyecto, alimentado por los commits Conventional).
- Antes de etiquetar, completar [`../Checklists/Release.md`](../Checklists/Release.md).

> El SemVer **del proyecto** es independiente del SemVer **del framework**
> (ver [`../CHANGELOG.md`](../CHANGELOG.md)). No los mezcles.

---

## Estructura `.github/` recomendada

```
.github/
├── workflows/
│   └── ci.yml                  # gates de CI (ver CI_CD.md)
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── pull_request_template.md    # desde Templates/Pull_Request_Template.md
├── CODEOWNERS                  # owners + módulos protegidos
└── dependabot.yml              # actualizaciones de dependencias
```

Todas las plantillas listas para copiar están en
[`../Templates/github/`](../Templates/github/) (ver su `README.md`).

---

## Higiene y seguridad del repositorio

- **Cero secretos en el repo.** `.env` y claves nunca se commitean
  (ver [`Secrets_Management.md`](Secrets_Management.md)). `.gitignore` correcto desde el día 1.
- **Secret scanning + Dependabot** activos (ver [`CI_CD.md`](CI_CD.md)).
- **Repos privados por defecto**; público solo por decisión explícita.
- **No reescribir historia pública.** Nada de `push --force` sobre ramas compartidas.
- Si un secreto se filtró: **rotarlo** (no basta con borrar el commit); ver
  [`Secrets_Management.md`](Secrets_Management.md).

---

## Reglas para agentes de IA

Coherente con [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md):

- Un agente **solo** hace `commit`/`push` cuando el humano lo pide explícitamente.
- **Nunca** commitea directo a `main`: crea una rama `tipo/descripcion` por tarea.
- **Nunca** usa `--force`, `--no-verify`, ni desactiva la firma (`-c commit.gpgsign=false`)
  salvo orden explícita. Si un hook falla, arregla la causa.
- Mensajes **Conventional** + `Co-Authored-By` del modelo.
- No abre PRs ni hace merge sin que el humano lo autorice.

---

## Anti-patrones
- ❌ Commitear directo a `main` saltándose el PR.
- ❌ Merge commit o force-push sobre `main` (rompe la historia lineal).
- ❌ Ramas de larga vida que divergen semanas de `main`.
- ❌ PR gigante que mezcla feature, refactor y fixes.
- ❌ Título de PR no-Conventional (ensucia el changelog automático).
- ❌ Módulo protegido sin owner en `CODEOWNERS`.
- ❌ Secretos en el repo / reescribir historia publicada.
- ❌ Agente que hace push sin que se lo pidan.

## Relacionado
- [`CI_CD.md`](CI_CD.md), [`Deployment.md`](Deployment.md), [`Secrets_Management.md`](Secrets_Management.md),
  [`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md),
  [`../09_AI/Protected_Modules.md`](../09_AI/Protected_Modules.md),
  [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md),
  [`../Templates/github/`](../Templates/github/),
  [`../Checklists/Release.md`](../Checklists/Release.md)
