# 002 · Stack packs: construir proyectos nuevos sobre lo que ya funciona en producción

## Por qué
Luis (24-sep-2026): «con todo lo que has aprendido de este proyecto (certera-webs), crea un
stack para construir proyectos iguales, con toda la tecnología, los lineamientos de UI, las
correcciones y las conciliaciones con Medusa, todo». Lo aprendido vivía disperso en memorias
de una sesión y en comentarios del repo: un proyecto nuevo lo repetiría todo desde cero.

## Historias
- **P1 · Un runtime arranca un proyecto con el stack** (`developer-new-project-from-stack`) y
  lee arquitectura, tecnología fijada, roles del equipo, reglas con su incidente, porteros y
  pasos de arranque (`developer_stack_get`, `developer://stacks/<id>`).
- **P1 · El gate exige las evidencias del stack**: un proyecto con la etiqueta
  `stack:<id>` no pasa sin las evidencias que ese stack declara, además de las de su nivel de
  riesgo. `developer_compliance_explain` lista los porteros concretos del stack.
- **P2 · El panel puede leer los stacks** (`GET /api/stacks`, `/api/stacks/:id`).

## Requisitos
- FR-1 Un stack pack es dato versionado (id, versión, etiqueta, origen, cuándo usarlo y cuándo no,
  arquitectura, tecnología, equipo, secciones de reglas con `rule`/`why`/`howToApply`, porteros
  mapeados a tipos de evidencia, evidencias obligatorias, arranque ordenado).
- FR-2 Primer stack: `medusa-commerce`, destilado de certera-webs.
- FR-3 Las evidencias del stack solo AÑADEN requisitos al gate; nunca relajan el nivel de riesgo.
- FR-4 Herramientas de solo lectura, idempotentes, sin acceso a mundo externo.

## Criterios de éxito
- SC-1 `npm run check` en verde con pruebas del registro y del gate con stack.
- SC-2 En producción, `tools/list` incluye `developer_stack_list` y `developer_stack_get`, y
  `developer_stack_get {stack:"medusa-commerce"}` devuelve el stack completo.

## Fuera de alcance
Generar código del proyecto (el control plane no controla runtimes ni sus espacios de trabajo).
