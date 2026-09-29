# 01 - Assembly Patterns (palmier-pro MCP)

Практические паттерны сборки. Тулы вызываются через `mcp__palmier-pro__<name>` (схемы подгружаются по ToolSearch при необходимости).

## Базовый цикл сборки

1. `get_timeline` -> fps, resolution, треки, существующие клипы, `canGenerate`.
2. `get_media` -> список ассетов с id (короткие префиксы) и `generationStatus`. Импорт новых: `import_media` (путь/папка) -> дождаться `generationStatus: none/ready`.
3. (по необходимости) `inspect_media <mediaRef>` - посмотреть кадры/транскрипт, убедиться что это нужный клип.
4. Раскладка: `add_clips` (трек, `startFrame`, `endFrame` или `source`) / `insert_clips` (трек, `atFrame`, `durationFrames` или `source`; раздвигает клипы после точки вставки), `includeAudio: false` для клипов без звука; тримы (`trimStartFrame/trimEndFrame` - офсеты ИСХОДНИКА, не таймлайна), длительность, `opacity`, `volumeDb` - через `set_clip_properties`, скорость - через `edit_speed`.
5. Правки: `set_clip_properties`, `move_clips`, `split_clips`, `remove_clips`, `ripple_delete_ranges`.
6. Звук: исходный звук клипов в ноль - `includeAudio: false` при раскладке, либо `volumeDb: -60` на клипах (`set_clip_properties`; `volumeDb: 0` - это исходный уровень, не тишина), либо `manage_tracks` set `muted: true` на треке.
7. Текст/тайтлы: `add_texts` / `add_captions` (E1/E2 бренд-кадры - статикой).
8. Цвет/эффекты: `apply_color` / `apply_effect` (грейд уже встроен в кадры - применять сдержанно).
9. Отмена: `undo`.

## Frame-math

- `frame = round(sec x fps)`. При 24fps: 4с = 96 кадров, 6с = 144, 8с = 192.
- Клип занимает `[startFrame, startFrame + durationFrames)` на своём треке.
- Длительность на таймлайне ≠ длине исходника: режется `trimStart/EndFrame` + `durationFrames`; скорость (`edit_speed`) тянет время.

## Каденс-грид (паттерн SECOND NATURE)

- **Бук-энды:** открытие и финал - пустой зал (B1), статикой/долго, дыхание кадра.
- **Рефрен:** материал-вставки (камень/медь/фарфор/бумага) короткими тайтовыми кусками, повтор x3 по ходу.
- **Кульминация (C1):** длиннее остальных (~6с), overhead тело во мхе.
- **Связки:** диссолвы (через `fadeInFrames/fadeOutFrames`/перекрытие с opacity-keyframes) на «якорных» переходах; жёсткие склейки (cut) на материал-вставках для ритма.
- **D1 (глаза открываются)** - короткий акцент перед/в кульминации.
- Весь исходный звук клипов - в ноль; музыка/саунд отдельным аудио-треком (если есть).

## Диссолв (перекрёстный)

Два клипа на соседних видео-треках с перекрытием по кадрам; на верхнем - `opacity` keyframes 1->0 (или `fadeInFrames/fadeOutFrames` через `set_clip_properties`) на длине перекрытия. Проверить порядок треков (выше трек = поверх).

## Keyframes

`set_keyframes` для плавных изменений (opacity для диссолва, transform для лёгкого пуш-ина статичного кадра). Держать движение минимальным - стиль сдержанный.

## Генерация прямо в Palmier (если нужно)

`generate_video/image/audio`, `upscale_media` - только при `canGenerate=true`. Перед вызовом `list_models` (поддержка длительности/aspect/рефов/голоса). Для нашего пайплайна основная генерация - снаружи (Higgsfield + Seedance), в Palmier в основном собираем и при нужде апскейлим/добиваем.

## Типичные грабли

- Передал удлинённый ID -> ошибка: ВСЕГДА короткий префикс как дал `get_timeline`/`get_media`.
- Перечитал `get_timeline` между своими правками и поймал гонку - не надо; доверяй возвратам мутаций.
- Забыл замьютить исходный звук клипов -> каша на финале.
- Гадал fps -> рассинхрон; всегда из `get_timeline`.
