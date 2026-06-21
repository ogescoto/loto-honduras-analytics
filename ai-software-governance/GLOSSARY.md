# Glosario (Lenguaje Ubicuo del Framework)

Términos que se usan con un significado preciso en todo el framework. Cuando un documento usa una de estas palabras, se refiere a esta definición.

---

## A

**ADR (Architecture Decision Record)**
Registro breve y fechado de una decisión de arquitectura: contexto, decisión tomada, alternativas y consecuencias. Ver [`07_Documentation/ADR.md`](07_Documentation/ADR.md).

**Agente (de IA)**
Cualquier herramienta de IA que lee, escribe o modifica código bajo este framework (Claude Code, Cursor, Copilot, Gemini, etc.). Un agente **no es autónomo sobre las reglas**.

**API pública (de un módulo)**
Conjunto explícito de comandos, consultas, eventos y tipos que un módulo expone para que otros lo usen. Todo lo demás es privado.

## B

**Bounded context**
Frontera lógica de un subdominio del negocio (terminología de DDD). Un módulo suele corresponder a un bounded context. Ver [`01_Architecture/Module_Organization.md`](01_Architecture/Module_Organization.md).

**Bóveda (vault)**
La carpeta `docs/` del proyecto, organizada como bóveda Obsidian con enlaces wiki. Es la **fuente de verdad** conceptual y técnica.

## D

**Definition of Done (DoD)**
Criterios que una tarea debe cumplir para considerarse terminada: código + tests + seeds + documentación + checklist. Ver checklists en [`Checklists/`](Checklists/).

**Dependencia**
Relación en la que un módulo necesita a otro. Deben ser **explícitas y unidireccionales** siempre que sea posible. Ver [`01_Architecture/Dependency_Rules.md`](01_Architecture/Dependency_Rules.md).

## I

**Idempotente**
Operación que produce el mismo resultado se ejecute una o muchas veces. Requisito para seeds de desarrollo. Ver [`03_Database/Seeds_Strategy.md`](03_Database/Seeds_Strategy.md).

## M

**Mandatory / Standard / Guideline / Recommendation**
Niveles de obligatoriedad de una política. Ver [`AI_START_HERE.md`](AI_START_HERE.md), sección 3.

**Manifiesto de módulo (`MODULE.yaml`)**
Archivo obligatorio en la raíz de cada módulo que declara su nombre, propósito, dependencias y protección. Ver [`Templates/Module_Template.md`](Templates/Module_Template.md).

**Módulo**
Unidad de organización del código correspondiente a un bounded context, con estructura interna estándar (domain/application/infrastructure/presentation).

**Módulo protegido**
Módulo o ruta declarada en `.aicodeprotect.yml` que la IA no puede modificar sin aprobación humana. Ver [`09_AI/Protected_Modules.md`](09_AI/Protected_Modules.md).

## S

**Seed (semilla)**
Datos iniciales que se cargan en una base de datos. Hay tres tipos: producción, desarrollo y test, con responsabilidades separadas.

## U

**Utilidad global**
Código compartido por varios módulos (helpers, logging, config, excepciones comunes). Su modificación es `mandatory`-sensible. Ver [`01_Architecture/Global_Utilities.md`](01_Architecture/Global_Utilities.md).

---

> Cada proyecto puede extender este glosario con los términos de su dominio en `docs/01_Dominio/Glosario.md`, pero **no debe redefinir** los términos de este archivo.
