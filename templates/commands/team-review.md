---
name: team-review
description: Lanza review pre-merge con code-reviewer + security-engineer + qa-engineer en paralelo.
---

# /team-review — Review pre-merge

El usuario quiere validar cambios antes de commit/PR. Lanza los revisores **en paralelo** (3 Agent calls en el mismo turno) para minimizar latencia.

## Argumentos
$ARGUMENTS (opcional: rango de archivos / commit / PR)

## Pasos

1. **Identifica el alcance**:
   - Si `$ARGUMENTS` está vacío: revisa el diff `git diff` o staged.
   - Si especifica archivos/commit/branch: úsalo como input.

2. **Invoca 3 agentes en paralelo** (una sola tool call message con 3 Agent invocations):
   - `code-reviewer` — Review estándar (SOLID, clean code, modularidad, SRP, DDD, smoke security).
   - `security-engineer` — Security review focalizado en cualquier superficie sensible tocada.
   - `qa-engineer` — Coverage analysis vs los cambios.

3. **Consolida los reportes**:
   ```
   ## Verdict consolidado
   APPROVE | APPROVE WITH NITS | REQUEST CHANGES | BLOCK
   
   ## Blocking issues (de cualquiera de los 3)
   <lista>
   
   ## Important issues
   <lista>
   
   ## Nits / suggestions
   <lista>
   
   ## Coverage gaps
   <de qa-engineer>
   
   ## Praise
   <lista>
   ```

4. **No declares "done"** si cualquiera de los 3 reporta BLOCK. Pasa los findings al usuario para fix o decisión explícita.

## Reglas

- Paraleliza siempre los 3 revisores. Son independientes.
- Si el diff es pequeño y sin superficie sensible, security-engineer puede reportar PASS rápidamente — pero NO lo saltes.
- Cita file:line en cada finding (los agentes ya lo hacen — preserva la cita en el consolidado).
