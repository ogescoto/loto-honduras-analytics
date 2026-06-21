# Plantillas `.github/` para el proyecto

Archivos listos para copiar a la carpeta `.github/` de cada proyecto que adopte el framework.
Son **agnósticos de stack**: adáptalos (versiones, comandos, owners) a tu proyecto.

> Política completa que los respalda:
> [`../../08_DevOps/Git_GitHub_Standards.md`](../../08_DevOps/Git_GitHub_Standards.md).

## Qué copiar y a dónde

| Plantilla (aquí) | Destino en el proyecto |
|---|---|
| `workflows/ci.yml` | `.github/workflows/ci.yml` |
| `CODEOWNERS` | `.github/CODEOWNERS` |
| `dependabot.yml` | `.github/dependabot.yml` |
| `ISSUE_TEMPLATE/bug_report.md` | `.github/ISSUE_TEMPLATE/bug_report.md` |
| `ISSUE_TEMPLATE/feature_request.md` | `.github/ISSUE_TEMPLATE/feature_request.md` |
| (ya existe) `../Pull_Request_Template.md` | `.github/pull_request_template.md` |

## Paso extra (no es un archivo)

`branch-protection.md` **no se copia**: es la **receta `gh api`** para aplicar las reglas de
protección de `main` de forma reproducible. Ejecútala una vez por proyecto.

## Orden recomendado (al incorporar el framework)

1. Copia las plantillas de esta carpeta a `.github/`.
2. Ajusta owners en `CODEOWNERS` y comandos en `ci.yml` a tu stack.
3. Aplica la protección de `main` con `branch-protection.md`.

Ver el paso integrado en [`../../Checklists/New_Project.md`](../../Checklists/New_Project.md).
