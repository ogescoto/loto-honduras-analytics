# Plantilla del skill `/init-project` (fuente única)

Esta carpeta es la **fuente única** del skill `/init-project`, que materializa el rol
`initiator` (ver [`../../09_AI/Agent_Roles_And_Lifecycle.md`](../../09_AI/Agent_Roles_And_Lifecycle.md)).

```
Init_Skill_Template/
├── SKILL.md       ← el skill (100% Markdown, sin scripts)
├── reference.md   ← guion de entrevista, heurísticas y ejemplo vestido
└── README.md      ← este archivo
```

## Qué hace

Convierte la idea del usuario en un **árbol ejecutable**: entrevista → `VISION` y `ALCANCE` →
metas (`M-*`) → tareas (`T-*`), **validando con el usuario en cada nivel**.

Es el único rol que **habla con el usuario para capturar intención**. Los demás ejecutan sobre
lo que él dejó escrito.

## Dónde encaja

```
Usuario: "quiero X"
    ↓
/init-project  →  VISION + ALCANCE   →  ¿aprueba? → itera
               →  METAS              →  ¿aprueba? → itera
               →  TAREAS             →  ¿aprueba? → itera
    ↓                                   (invocando /usecases y /screens)
docs/07_Implementacion/  →  dev · test-runner · debugger · mapper
```

**No escribe código.** Produce el plan; otros lo ejecutan.

## Instalación en un proyecto

```bash
mkdir -p .claude/skills/init-project
cp <framework>/Templates/Init_Skill_Template/SKILL.md     .claude/skills/init-project/
cp <framework>/Templates/Init_Skill_Template/reference.md .claude/skills/init-project/
```

Uso:

```
/init-project Un sistema para que los cajeros de la clínica cuadren la caja
/init-project meta Reportes de arqueo mensual      ← meta nueva en proyecto existente
/init-project                                       ← reporta estado y pregunta
```

## Lo que nunca hace

- No inventa reglas de negocio: lo no confirmado va como `[SUPUESTO — confirmar]`.
- No baja de nivel sin aprobación explícita del usuario.
- No escribe código.
- No escribe en la bóveda curada: `docs/00_Proyecto/` lo persiste `/obsidian`.

## Mantenerlo "siempre actualizado"

La instalación es una **copia**; vuelve a copiar al migrar de versión del framework (ver
[`../../00_Governance/Framework_Access_Standard.md`](../../00_Governance/Framework_Access_Standard.md)).

> **Copia, no enlace.** Un skill es ejecutable: no debe cambiar bajo los pies de un agente a
> mitad de tarea.
