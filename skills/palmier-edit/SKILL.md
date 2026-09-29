---
name: palmier-edit
description: Сборка и монтаж видео-таймлайна в Palmier (AI-native редактор) через palmier-pro MCP - импорт клипов, раскладка по каденс-сетке, диссолвы/склейки, frame-math, мьют исходного звука, экспорт. Use when assembling generated clips into a timeline, building a campaign edit, cutting to a cadence grid, or any palmier-pro MCP editing task.
---

# Palmier Edit - сборка таймлайна (palmier-pro MCP)

Монтажёр в Palmier через MCP-сервер `palmier-pro`. Собираешь сгенерённые клипы в готовый монтаж. Подробные паттерны - `01_assembly-patterns.md`.

## Всегда в начале

1. **`get_timeline`** один раз за сессию (или после внешнего изменения) -> fps, resolution, totalFrames, треки (тип+порядок), клипы с кадрами, `canGenerate`. clipId/trackId отсюда принимают все прочие тулы.
2. **`get_media`** перед обращением к любому ассету - каждый mediaRef берётся отсюда (+ `generationStatus`).
3. **`inspect_media`** чтобы реально посмотреть ассет (кадры видео + транскрипт, размеры картинки) - описывай что видишь, не выдумывай.

## Жёсткие правила

- Всё время - в КАДРАХ, не секундах: `frame = round(sec x fps)`.
- ID (clipId/mediaRef/folderId) возвращаются короткими префиксами - передавай ОБРАТНО ровно как дали, не дополняй и не угадывай длинную форму.
- Мутации (add/insert/set/split) возвращают изменённые ID и кадры - НЕ перечитывай `get_timeline` между своими правками; перечитывай только после сбоя, похожего на устаревшую модель.
- `canGenerate=false` -> все generate/upscale-тулы упадут; сначала сказать пользователю залогиниться/подписаться в Palmier. `inspect_media` (транскрипция on-device) работает всегда.
- `list_models` перед `generate_video/image/audio` / `upscale_media` - проверить поддержку длительности/aspect/рефов.

## Дефолты кампании SECOND NATURE

- Холст **1440x1080 @ 24fps** (4:3).
- Каденс в духе референс-кампании: рефрен материал-вставок x3, бук-энды (пустой зал B1), кульминация длиннее (~6с), диссолвы на якоря, жёсткие склейки на вставки, **исходный звук в ноль**.
- Кат-лист и инвентарь - в `<ai-visual-root>/<campaign>/PROGRESS.md`.

## Enforcement

- NEVER гадать fps/формат - взять из `get_timeline`.
- NEVER дополнять короткие ID.
- NEVER перечитывать таймлайн между собственными мутациями без причины.
- ALWAYS `get_media`/`inspect_media` перед ссылкой на ассет.
