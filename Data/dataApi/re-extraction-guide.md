# Guía de Re-Extracción

Si en el futuro es necesario re-extraer los datos (por ejemplo, si la API cambia),
sigue estos pasos:

## 1. Re-Investigar la API

Ejecuta el script de investigación para descubrir los endpoints actuales:

```bash
npm run investigate
```

Esto:
- Lanza Puppeteer
- Captura todas las llamadas XHR/fetch a la API
- Guarda los resultados en `docs/dataApi/api-blueprint.json`
- Genera `docs/dataApi/README.md` actualizado

## 2. Verificar Endpoints

Revisa `docs/dataApi/api-blueprint.json` y confirma que los endpoints
siguen siendo accesibles y devuelven el mismo formato.

Puedes probar manualmente:

```bash
# Obtener feed de resultados
curl -s "https://api.loteriasdehonduras.com/honduras/feed/game-stats" | head -c 2000

# Obtener configuración del sitio
curl -s "https://api.loteriasdehonduras.com/honduras/sites/env?date=$(date -u +%Y-%m-%dT04:00:00.000Z)" | head -c 1000
```

## 3. Actualizar Backfill Script

Si los endpoints o el formato de respuesta cambiaron:

1. Editar `src/local/03-backfill.ts`
2. Actualizar las URLs de los endpoints si cambiaron
3. Actualizar el parser si el schema de respuesta cambió
4. Actualizar este documento

## 4. Probar con una Fecha de Muestra

```bash
# Probar que el backfill funciona para una fecha específica
tsx src/local/03-backfill.ts --date 2025-06-01 --dry-run
```

## 5. Ejecutar Backfill Completo

```bash
npm run backfill
```

## 6. Subir Datos a R2

```bash
npm run upload:r2
```

## 7. Re-desplegar Workers

```bash
npm run deploy:api
npm run deploy:cron
npm run deploy:pages
```

## Troubleshooting

| Problema | Posible Causa | Solución |
|----------|---------------|----------|
| API 404 | Endpoint cambió | Re-ejecutar `npm run investigate` |
| Payload vacío | Auth requerido ahora | Buscar tokens en las JS bundles |
| Timeout en Puppeteer | Selector del calendario cambió | Actualizar `01-investigate-api.ts` |
| CORS errors | API bloquea requests directos | Usar Puppeteer con referer header |
