# 01 - Prompt Craft: анти-слоп, регистры, couture-ключ

Главный принцип всех регистров: **якорить к реальному носителю съёмки + конкретика + несовершенство**, а не «красиво/кинематографично».

Порядок приоритетов внутри этого принципа: **свет -> носитель -> конкретика -> сдержанность.** Свет закрывается первым и отдельным слотом (раздел ниже), всё остальное кладётся поверх него.

## Свет - первый слот ( главное правило кадра)

**Сначала попадаем светом, потом всё остальное.** Кадр с точной светосхемой и средним гардеробом читается как фотография; кадр с идеальным гардеробом и «просто светло» - как рендер. Свет - не прилагательное к сцене, а **отдельный обязательный слот промпта**, который закрывается первым.

Порядок слотов промпта: субъект -> носитель/стиль -> **СВЕТ** -> композиция -> настроение -> техничка (грейн/оптика).

### Формула источника - шесть слотов, закрывать все

источник -> направление -> качество -> температура/грейд -> падение -> атмосфера

| Слот | Что писать | Дословные заготовки |
|---|---|---|
| **источник** | что именно светит, названо предметно | `a hard shaft of daylight`, `dim bare tungsten bulbs`, `direct harsh on-camera flash`, `soft overcast daylight`, `one large softbox` |
| **направление** | откуда + высота | `coming from the left`, `high and to one side`, `from behind and above`, `frontal, flat` |
| **качество** | hard/soft + размер источника | `hard, small source, sharp-edged shadows` / `soft, large source, diffused shadows` |
| **температура/грейд** | конкретный цвет, не «тёплый вайб» | `cool desaturated grade with clean neutral whites`, `weak sickly warm light`, `teal-and-amber grade` |
| **падение** | что уходит в тень | `deep falloff into shadow`, `heavy falloff`, `mostly swallowed by deep shadow` |
| **атмосфера** | чем проявлен луч (или ничем - чаще честнее) | `dust in the air`, `halation around the practicals` |

Проверка на пустоту: `teal-and-amber grade with hard shadows` работает, `cinematic lighting` - нет. Модель обучена на описаниях приёмов, а не на оценках.

### Словарь - говорить терминами света, а не оценками

- **Схема:** key (ключ) / fill (заполняющий) / back-rim (контровой, обводка по силуэту) / kicker (боковой скользящий).
- **Природа источника:** practical (лампа видна в кадре) / motivated (искусственный, притворяющийся практиком) / available (что есть на локации).
- **Качество:** hard (маленький источник, резкая граница тени) vs soft (большой, размытая).
- **Регистр:** high-key (светло, низкий контраст) vs low-key (темно, высокий) vs chiaroscuro (жёсткий контраст света и тьмы).
- **Портретные схемы:** Rembrandt (треугольник света под глазом на теневой стороне - наша рабочая для couture-портретов), top light, underlight.
- **Контраст словами через ratio key:fill:** 2:1 - плоско/документально, 4:1 - рабочий портрет, 8:1+ - драма. Писать так: `key-to-fill about 4:1, the shadow side reads dark but not black`.

### Почему свет идёт первым - механика моделей

`nano_banana_2` (Nano Banana Pro) сначала просчитывает композицию и **свет**, и только потом рисует пиксели. То есть подробная светосхема попадает в стадию планирования кадра, а не «дорисовывается» поверх. Это самый дешёвый рычаг качества, который у нас есть: одна точная фраза про свет двигает кадр сильнее, чем три прилагательных про фактуру.

### Свет как анти-пластик (обобщение правила «свет НЕ гладит металл»)

Пластик и CGI считываются глазом **в первую очередь по свету**, а не по геометрии:

- **Жёсткий спекуляр = PBR-металл = рендер.** Луч, скользящий по золоту/меди/фарфору/лаку - гарантированный слоп. Не назначать raking shaft на блестящую фактуру.
- **Halation вокруг практиков + недодержка + heavy falloff = плёнка.** Это не хак, а нормальное поведение носителя; модель это знает.
- **Ровный студийный свет без источника делает пластиковым всё**, даже верный гардероб и верный грейд.

Лечение всегда одно: слабые практики вместо направленного луча, тень как основной объём кадра, расфокус фона.

### Relight-lock - правка и производные кадры без перезасветки

При редактировании и при генерации производных от канонического рефа модель **по умолчанию пересвечивает сцену** - и континуити рассыпается. Порядок в промпте: сначала список залоченного, потом то, что меняется.

Дословно:
`keep the existing lighting exactly as in the reference - same source, direction, colour temperature and shadow falloff; do not relight or recolor beyond the new ambient light; no new reflections or hotspots.`

Плюс ref-driven правило (см. Анти-слоп доктрина, п.8): `match the lighting of the reference EXACTLY`, а своими словами про свет - минимум, иначе слова спорят с рефом.

### Дефолтные светосхемы по регистрам

| Регистр | Свет по умолчанию |
|---|---|
| **A. SOUL flash** | `direct harsh on-camera flash, frontal, hard, blown near-field, black falloff behind` - контраст даёт сама вспышка, вторых источников не добавлять |
| **B. CINEMA film-still** | `a hard shaft of daylight from a high side window, key-to-fill about 4:1, deep falloff into shadow, dust in the air` |
| **C. COUTURE-material** | Rembrandt-ключ мягко: `soft key high and to one side, a gentle triangle under the eye on the shadow side, deep falloff, no specular sheen on the garment` - фактуру наряда лепит боковой свет, фронтальный её убивает |
| **Детали-кропы** | свет НЕ назначаем - берём с рефа через relight-lock |
| **«Богатый» интерьер** | только слабые практики, см. раздел про золото ниже |

### Свето-чек перед каждой генерацией

1. Источник назван предметно? 2. Направление и высота? 3. hard или soft? 4. Куда уходит тень (falloff)? 5. Не назначен ли спекуляр по блестящей фактуре? 6. Если есть реф - стоит ли relight-lock? 7. Если кадр в серии - совпадает ли световая карточка со сценой (см. `03_pipeline.md` -> Континуити)?

## Анти-слоп доктрина

1. **Реальный носитель** - `2000s flash film photograph` / `35mm motion-picture` / `Cinematic film still, frame grab from a high-fashion art film`.
2. **Грейн и несовершенство** цвета: `desaturated cinematic grade`, `35mm film grain`, `washed imperfect colors`.
3. **Конкретные мирские детали** вместо глянца (веснушки, строчка на костюме, пыль в луче, пятна на бетоне).
4. **Один связный фокус-план** + `shallow focus on the face`.
5. **Сдержанность:** `restrained, minimal, nothing busy, generous negative space`. Перебор god-rays/джунглей/потопов = «колхоз».
6. **Бан-слова:** beautiful, cinematic (без раскрытия), amazing, cool, dreamy, stunning. Отдельно по свету - пустые и запрещённые: `good/beautiful/perfect lighting`, `well-lit`, `dramatic lighting` и `studio lighting` без раскрытой схемы. Свет описывается формулой, а не оценкой.
7. **Бан-хвост (дословно, в конец промпта, когда лезет пластик/CGI):** `NOT CGI, NOT 3D render, NOT video game, NO glossy shine, NO specular highlights, NO plastic sheen; raw heavy 35mm grain, washed imperfect desaturated colours, gritty, photographic.`
8. **Ref-driven > словесное описание.** Жёсткие слова про цвет/структуру СПОРЯТ с рефом и мутят кадр. Формула: `match the wall / tone / structure / lighting of the reference EXACTLY`, словами - минимум. Тон бетона (тёплый кремовый и т.п.) НЕ описывать словами - вести от принятого рефа с нужным тоном.

## Три рабочих регистра

### A. SOUL flash snapshot (живой, не постановочный)
Движок (дословно): `2000s flash film photograph, direct harsh on-camera flash, raw heavy grain, candid unposed snapshot, washed imperfect colors, alive and real, nothing staged.` + предельно конкретная бытовая/сюр-сцена.

### B. CINEMA film-still (наш базовый для портретов)
`Cinematic film still, frame grab from a high-fashion art film. <субъект+характер+гардероб+живой элемент>. <локация: bare concrete hall>, <СВЕТ по формуле: a hard shaft of daylight from a high side window, key-to-fill about 4:1, deep falloff into shadow>, dust in the air, <эмоция>. Anamorphic widescreen, desaturated cinematic grade, 35mm motion-picture grain, shallow focus on the face, photorealistic, the uncanny illusion of living <материал>, a held movie frame.`
Свет - по формуле из «Свет - первый слот», все шесть слотов, а не одним словом. Негативы по месту: `no camera flash`, `no people`.

### C. COUTURE-MATERIAL ( ключ к разгадке пластика/слопа)
Это формула «живой одежды» (кампания SECOND NATURE: камень/бумага/медь/фарфор, сквозь которые лезет мох/цветы/verdigris/ростки).

**ПРАВИЛО:** материал = СКОНСТРУИРОВАННЫЙ couture-наряд на стилизованной модели - плиты внахлёст, швы/строчка, воротники, структурные плечи. Снимать как фэшн-портрет, **фокус на ЛИЦЕ**. Разная модель под каждый материал. `wearing a garment that looks exactly like X` - ПРАВИЛЬНО (она про ТКАНЬ наряда).

**Три провала, которые давали пластик/слоп (НЕ делать):**
| Провал | Симптом |
|---|---|
| материал как ПЛОТЬ/кожа (торс, бюст) | пластик + триггер NSFW |
| материал как АБСТРАКТНАЯ ТЕКСТУРА (макро-swatch, плитка) | 3D-рендер-слоп |
| убрали модель/крой/лицо («no person, surface fills frame») | потеря фэшн-реальности и масштаба |

Эталон-портрет (Пользователь одобрил): `Cinematic film still, frame grab from a high-fashion art film. A striking androgynous person with a shaved head and weathered noble features, mid-40s, wearing a sculptural garment that looks exactly like cracked grey weathered stone, emerald-green moss creeping across the surface of the fabric. Bare concrete hall, a hard shaft of daylight, dust in the air, calm composed expression. Anamorphic widescreen, desaturated cinematic grade, 35mm motion-picture grain, shallow focus on the face, photorealistic, the uncanny illusion of living stone, a held movie frame.`

## Детали-вставки (макро-моменты БЕЗ слопа)

Не абстрактный макро, а **tight-crop реального couture-наряда**. Рецепт (модель `nano_banana_2`, реф = couture-стилл из серии):
`Photorealistic 35mm film still, an extreme close detail from a high-fashion art film. A tight crop on the sculptural couture garment from the reference image - <конструкция: overlapping plates / structured collar / shoulder plates> of <материал> with <швы/edges>, <живой элемент>. No face, framing on the garment and shoulder only, the model's neck just visible for scale. Real <материал> with true texture ... shot on real film, not CGI, not plastic, the uncanny illusion of living X, a held movie frame.`
**Обязательно** оставлять контекст тела (шея/плечо/строчка) - это якорь масштаба, без него пластик.

## «Богатый» интерьер (золото/металл/лампы) - рычаги против глянца

Сцены типа «vault с золотом» - худший слоп-магнит: модель рендерит золото как PBR-металл (CGI-блик). Рычаги, применять ВСЕ сразу:

1. **Лексика материала:** никогда не голое `gold`. Только `tarnished, oxidised, dull brass-brown gold, blackened bronze, matte with a film of dust and soot, verdigris patina`. Блеск убить на уровне существительных, не только негативов.
2. **Дефицит + тень:** не «hoard/heaps» во весь кадр - `a few dull stacks... mostly swallowed by deep shadow`. Чем меньше металла видно резко, тем меньше поверхности для CGI-бликов.
3. **Свет НЕ гладит металл** (частный случай «Свет как анти-пластик» выше)**:** raking shaft / луч по сокровищам = гарантированный спекуляр. Вместо этого слабые практические лампы: `dim bare tungsten bulbs, weak sickly warm light, heavy falloff, halation around the practicals` - halation и underexposure читаются как плёнка.
4. **Расфокус на фоне:** `the hoard soft and out of focus behind her, shallow focus on the face` - расфокус убивает рендерную детализацию.
5. **Бан-хвост** (см. Анти-слоп доктрина, п.7) - дословно в конец.
6. **Реф:** 1 принятый матовый кадр той же серии (грейд/фактура) + 1 портрет персонажа; `match the grade, grain and matte surfaces of the reference EXACTLY`. НЕ добавлять третий реф «для богатства».

## Лицо

- В Soul лицо держится только КРУПНО и почти ФРОНТАЛЬНО; профиль/мелкая ростовая -> дрейф вплоть до другого человека.
- Глаза-инсёрт и overhead: см. `02_higgsfield-routing.md` (реф навязывает фронтальный портрет на soul -> брать `nano_banana_2`).
- NSFW: `fully clothed, opaque, covered, no exposed skin` + safe-блок всегда, где материал близко к телу.

## Слова-приборы рисуют приборы (урок 2026-09-23, hifi-spec t7)

`nano_banana_pro`: если в промпте есть существительные оборудования - `photographic studio`, `softbox`, `reflector`, `C-stand`, - модель ставит их В КАДР (стойки, софтбокс, край рулона), даже с негативами «no stands, no lights». Негатив с существительным = тот же промпт для модели. Для ЧИСТОГО студийного кадра описывать свет как эффект (`one large soft source high and to the left`, `soft fill from low right`) и фон как материал (`off-white seamless paper sweeping onto the floor`), без названий приборов и без их отрицаний; «nothing else in frame: only the pair and the paper». Для кадра-«разоблачения» съёмочной площадки - наоборот, перечислять оборудование предметно, это работает на нас.


## Вакуум / exploded view на nano (урок 2026-09-23, hifi-spec t5/t6)
- Предмет «в вакууме»: писать `pure white empty space, no floor, no horizon, no ground shadow`; слова studio/backdrop/paper/table/floor рисуют предметы. «Floating» почти всегда даёт мягкую тень на воображаемом полу - дешевле вытереть ретушью, чем перегонять.
- Пара кадров старт->конец одной камерой: конец генерить от принятого старта (FIRST = старт). В сложной правке (разлёт деталей) nano ОТЗЕРКАЛИВАЕТ ракурс 3/4 - держать привязкой к видимым приметам («narrow side wall on the left, front with the badge on the right») + «edit the first reference in place, do not mirror or re-frame».
- Масштаб в процентах высоты кадра модель игнорирует (просили 60%, получали 77-91%) - задавать через рамку/поля словами («generous white margin above and below»), не числом.
- Apple-стиль разлёта: «every part displaced along its own axis, equal gaps, everything parallel, nothing rotated» - читается, но модель дорисовывает лишние детали (магнит-кольцо) и неравные зазоры; проверять по частям.
