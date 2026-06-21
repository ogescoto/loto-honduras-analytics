---
obligation: standard
area: devops
applies_to: all projects
---

# Integración y Despliegue Continuo (CI/CD)

## Propósito
Automatizar la verificación de calidad y el despliegue, de modo que ningún cambio llegue a producción sin pasar las puertas de calidad.

## Principios
- **Todo PR pasa por CI.** No hay merge sin CI verde.
- **Las puertas (gates) están definidas y son obligatorias.**
- **El pipeline es la verdad**, no la máquina de un desarrollador.

## Etapas del pipeline (orden)

```
1. Setup        → instalar dependencias (cacheadas), fijar versiones
2. Lint/Format  → estilo y reglas estáticas (incluye a11y, imports)
3. Type check   → tipado estático
4. Tests        → unitarios + integración (con seed:test)
5. Coverage     → gate de cobertura (ver Coverage_Requirements.md)
6. Build        → compilación/empaquetado
7. E2E          → flujos críticos (en entorno efímero/staging)
8. Security     → auditoría de dependencias, SAST, secret scanning
9. Docs check   → (opcional) enlaces de bóveda; la coherencia la garantiza /obsidian
10. Deploy      → preview (PR) / staging / production
```

## Puertas de calidad (gates) obligatorias
Un PR **no se mergea** si falla cualquiera de:
- [ ] Lint / format.
- [ ] Type check.
- [ ] Tests (unitarios + integración).
- [ ] Cobertura (global y diff) por encima del umbral.
- [ ] Auditoría de dependencias sin vulnerabilidades críticas.
- [ ] Sin secretos detectados (secret scanning).

> La validación de enlaces de la bóveda es **opcional** en CI: la fuente de verdad la mantiene el Experto Obsidian (`/obsidian`, ver [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md)). Si quieres una red de seguridad, añade `check_obsidian_links.py` como check no bloqueante.

## Ejemplo: workflow (GitHub Actions, esquemático)

```yaml
name: ci
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage      # usa seed:test
      - run: npm run build
      - run: npx audit-ci --moderate
      # opcional (no bloqueante): red de seguridad de enlaces de la bóveda
      - run: python Tools/check_obsidian_links.py docs/ || true
  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx playwright install --with-deps
      - run: npm run seed:test
      - run: npm run test:e2e
```

> Adapta la herramienta (GitHub Actions, GitLab CI, etc.) manteniendo las etapas y gates.

## Despliegue continuo
- **Preview por PR:** cada PR genera un entorno/URL de previsualización (ver [`Deployment.md`](Deployment.md)).
- **Promoción controlada:** staging → producción con aprobación, no automática a producción salvo decisión explícita del proyecto.
- **Rollback** siempre disponible (ver [`Deployment.md`](Deployment.md)).

## Secret scanning y seguridad
- Escaneo de secretos en cada commit/PR (no permitir claves en el repo).
- Auditoría de dependencias automatizada (Dependabot/Renovate + `audit`).
- Ver [`../04_Backend/Security.md`](../04_Backend/Security.md) y [`Secrets_Management.md`](Secrets_Management.md).

## Reglas para el agente
- No desactives gates de CI para "que pase". Arregla la causa.
- No subas artefactos con secretos.
- Si añades una etapa, documenta en este archivo o en el del proyecto.

## Anti-patrones
- ❌ Saltarse CI con merges directos a la rama protegida (ver protección de ramas en [`Git_GitHub_Standards.md`](Git_GitHub_Standards.md)).
- ❌ Desactivar tests/cobertura para desbloquear un merge.
- ❌ Desplegar a producción sin pasar por staging.
- ❌ Pipelines que dependen de estado local no reproducible.

## Relacionado
- [`Git_GitHub_Standards.md`](Git_GitHub_Standards.md), [`Deployment.md`](Deployment.md), [`Environments.md`](Environments.md), [`Secrets_Management.md`](Secrets_Management.md), [`../06_Testing/Coverage_Requirements.md`](../06_Testing/Coverage_Requirements.md)
