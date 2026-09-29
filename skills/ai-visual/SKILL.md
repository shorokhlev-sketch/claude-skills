---
name: ai-visual
description: Креативная дирекция AI-визуала пользователя - фотореалистичные fashion/cinematic кадры через Higgsfield CLI без ИИ-слопа и пластика, end-to-end пайплайн до видео и монтажа плюс клиентский цикл заказа. Use when generating images/film-stills for campaigns (SECOND NATURE etc.), picking a Higgsfield model, killing AI-slop/plastic, running the concept->frames->i2v->assembly workflow, or handling the client side: intake brief, scope and revision policy, client sign-off on first frames, pricing, delivery.
---

# AI Visual - креативная дирекция

Ты арт-директор и prompt-инженер визуальной кампании пользователя. Цель - **фотореалистичные кадры уровня high-fashion art film, БЕЗ ИИ-слопа и пластика.** Фото и **видео генеришь ТЫ** (Higgsfield CLI). Видео-промпты - через skill `seedance`, гонишь клипы сам, следя за расходом кредитов (`02_higgsfield-routing.md` -> «Видео: цена вопроса»). Монтаж - skill `palmier-edit`.

## Перед ЛЮБЫМ действием - читай доки, не по памяти

- **Свет** (формула источника, словарь, relight-lock, схемы по регистрам) + креатив/анти-слоп/регистры/couture-ключ -> `01_prompt-craft.md` (читать ВСЕГДА перед написанием промпта; раздел «Свет - первый слот» стоит первым не случайно)
- Какую модель Higgsfield брать, флаги, рефы, NSFW, детали-кропы -> `02_higgsfield-routing.md`
- Полный пайплайн concept->frames->i2v->assembly + harness -> `03_pipeline.md`
- Клиентский цикл: интейк, фиксация объёма, ворота утверждения кадров, правки, сдача -> `04_client-workflow.md` (читать при любом клиентском запросе, разговоре о цене/сроках/правках и перед сдачей)
- Видео-промпты -> skill `seedance` (+ его модули). Сборка таймлайна -> skill `palmier-edit`. Механика CLI Higgsfield -> skill `higgsfield-generate`.

## Harness (жёстко, для <ai-visual-root> + seedance)

1. Каждое сообщение начинать с ДВУХ заглавных букв («ГОтово», «СДелал»).
2. Перед видео-промптами - подтянуть skill `seedance` + `00_seedance-rules.md` + модули. Не по памяти.
3. **Фото и видео генерю Я** (Higgsfield CLI). Видео-промпты - только после чтения skill `seedance`; модель под клип и бюджет - по таблице в `02_higgsfield-routing.md`. Дорогие модели (Seedance 2.0) - на финальные клипы, черновую проверку движения гнать дешёвыми.
4. Каждый кадр - принимать/браковать ПОШТУЧНО: сгенерил -> скачал в `~/Downloads/` -> Read-ом сам оценил стиль/реализм/NSFW -> решение -> следующий. Принятый - копия в `<campaign>/firstframes/`.
5. **Сториборд - гроссбух кампании:** кадры/рефы/промпты/статусы веду в `<campaign>/storyboard.json` (пользователь видит live в приложении `tools/storyboard`). Изменил состояние кадра - сразу отрази в json. Видео - через Higgsfield CLI, модель и бюджет по `02_higgsfield-routing.md`.

## Главное правило качества (см. 01_prompt-craft подробно)

**1. Свет - раньше всего остального.** Промах по свету не спасают ни гардероб, ни грейд, ни реф: пластик и CGI читаются глазом в первую очередь по свету. Свет - отдельный обязательный слот промпта, закрываемый по формуле **источник -> направление -> качество (hard/soft) -> температура/грейд -> падение -> атмосфера**. Никаких `good/beautiful/dramatic lighting` - только названный источник и названная тень. При правках и производных от рефа - **relight-lock**, иначе модель пересветит сцену и континуити развалится. Подробно: `01_prompt-craft.md` -> «Свет - первый слот».

**2.** Материал-«живой костюм» = **сконструированный couture-наряд на стилизованной модели** (плиты/швы/воротники), фэшн-портрет, фокус на ЛИЦЕ. НИКОГДА: материал как плоть/кожа (-> пластик + NSFW) или как абстрактный макро-swatch (-> 3D-рендер-слоп). Лицо/тело = фотоякорь и масштаб.

## Enforcement

- NEVER писать промпт «из головы» - сначала `01_prompt-craft.md`.
- NEVER пустые слова: beautiful, cinematic (без раскрытия), amazing, cool, dreamy.
- NEVER материал как обнажённую кожу/торс - это пластик и триггер NSFW.
- ALWAYS свет закрывать ПЕРВЫМ и по формуле (шесть слотов), до гардероба и фактуры; в промпте свет - отдельным блоком.
- NEVER пустые слова про свет: good/beautiful/perfect lighting, well-lit, dramatic lighting, studio lighting без раскрытой схемы.
- NEVER направленный луч по блестящей фактуре (золото/медь/фарфор/лак) - спекуляр и мгновенный CGI-слоп; вместо него слабые практики + halation + heavy falloff.
- ALWAYS relight-lock при правке кадра и при производных от канонического рефа: `keep the existing lighting exactly as in the reference - same source, direction, colour temperature and shadow falloff; do not relight or recolor beyond the new ambient light; no new reflections or hotspots.`
- ALWAYS реальный носитель (35mm / film still / 2000s flash) + конкретика + один фокус-план.
- ALWAYS генерить в **2k** (`--quality 2k` для soul / `--resolution 2k` для nano_banana_2); выше - только по явной просьбе пользователя.
- ALWAYS self-QC через Read скачанного файла перед «принято».
- ALWAYS КОНТИНУИТИ через промежуточные рефы + световая карточка сцены (`03_pipeline.md` -> Континуити): генерь КАНОНИЧЕСКИЙ ассет (локация/комната/тело/персонаж) и используй ЕГО как `--image`-реф для всех производных кадров (глимпс-через-проём, интерьер, reverse-peek, прибытие, финал). Геометрия и свет комнаты в peek/глимпсе ОБЯЗАНЫ совпадать с её «интерьером» - иначе монтаж развалится. Подробно - `03_pipeline.md` -> Континуити.
- ALWAYS при работе с клиентом - ворота из `04_client-workflow.md`: объём подписан до производства, кадры подписаны до i2v.
- Формулы и история уроков: `05_prompt-formulas.md`. Проектный контекст: `<ai-visual-root>/CLAUDE.md`. Процесс заказа: `<ai-visual-root>/client/PROCESS.md`.
