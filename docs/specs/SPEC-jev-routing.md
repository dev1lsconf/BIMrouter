# Spec: `jev-routing`

## Objetivo

Convertir cada prompt en una decisión tipada auditable. Usar el SDK oficial TypeSafe desde servidor y una evaluación por prompt con tres preguntas independientes sobre el mismo estado.

## Contrato de decisión

- `Noul`: “¿Esta solicitud trata sobre consultar, analizar o medir un modelo BIM?” Interpretar su resultado como probabilidad de sí. Si `< 0,5`, resultado `out_of_scope`; con `>= 0,5`, continuar.
- `Choice`: escoger exactamente uno de `model`, `clashes`, `quantities`, `architecture`, `structure`, `mep`, cada uno con descripción delimitadora. La opción retornada determina el agente.
- `Score`: claridad del prompt en cinco niveles ordenados, desde muy ambiguo hasta específico y accionable. Mostrar valor, leyenda, distribución/confianza que el proveedor incluya; solo informativo.

Noul y Choice son evaluaciones independientes dentro de la misma llamada. La aplicación aplica el gate después de recibir todos los resultados. No se solicita una segunda llamada para enrutar.

## Salida y fallos

Exponer al dashboard los resultados tipados, modelo, uso de tokens y duración. Validar que `Choice` pertenezca al conjunto permitido y que las respuestas estén presentes. Un error HTTP, parseo o resultado malformado produce un fallo visible; no se adivina ruta ni se responde con datos simulados. Los tokens de JEV se contabilizan aunque el gate detenga el turno.

## Criterios y verificación

- Casos `Noul` 0,49, 0,50 y 0,95 cubren rechazo y continuación.
- Las seis opciones de Choice se preservan sin normalizaciones ambiguas.
- Score fuera del rango descrito, respuestas ausentes y errores del SDK no activan agente.
- Una consulta fuera de dominio no llama a OpenRouter.
