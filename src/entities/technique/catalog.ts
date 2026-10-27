import type { Technique } from './model'

export const techniques: Technique[] = [
  {
    id: 'grounding',
    school: 'mindfulness',
    situations: ['panic', 'crisis', 'urge'],
    durationMin: 3,
    intensity: 'crisis',
    copy: {
      ru: {
        title: 'Пять опор вокруг',
        when: 'Тело уехало, комната стала «не настоящей», или накрыло волной.',
        caution: 'Если смотреть по сторонам становится ещё страшнее — закройте глаза и вернитесь к выдоху.',
        steps: [
          'Назовите 5 вещей, которые видите.',
          '4, которые можете коснуться.',
          '3 звука, 2 запаха, 1 вкус или глоток воды.',
          'Говорите медленно, вслух или шёпотом.',
        ],
      },
      en: {
        title: 'Five anchors around you',
        when: 'The body has gone ahead, the room feels unreal, or a wave just hit.',
        caution: 'If looking around makes it worse, close your eyes and return to the exhale.',
        steps: [
          'Name 5 things you can see.',
          '4 you can touch.',
          '3 sounds, 2 smells, 1 taste or a sip of water.',
          'Go slowly, out loud or in a whisper.',
        ],
      },
      sl: {
        title: 'Pet sider okoli vas',
        when: 'Telo je ušlo naprej, prostor deluje neresničen, ali pa vas je preplavil val.',
        caution: 'Če gledanje naokoli poslabša stanje, zaprite oči in se vrnite k izdihu.',
        steps: [
          'Poimenujte 5 stvari, ki jih vidite.',
          '4, ki se jih lahko dotaknete.',
          '3 zvoke, 2 vonja, 1 okus ali požirek vode.',
          'Govorite počasi, na glas ali šepetaje.',
        ],
      },
    },
  },
  {
    id: 'long-exhale',
    school: 'behavioral',
    situations: ['panic', 'crisis', 'insomnia'],
    durationMin: 2,
    intensity: 'crisis',
    copy: {
      ru: {
        title: 'Выдох длиннее вдоха',
        when: 'Сердце колотит, дыхание короткое, трудно договорить фразу.',
        caution: 'Если кружится голова — дышите как получается, без задержек.',
        steps: [
          'Вдох через нос на 3 счёта.',
          'Выдох через рот на 5–6 счётов.',
          'Плечи опустите на выдохе.',
          'Повторите 8–10 циклов.',
        ],
      },
      en: {
        title: 'Longer exhale',
        when: 'The heart is racing, breath is short, a sentence will not finish.',
        caution: 'If you feel dizzy, breathe in a way that works. Do not hold the breath.',
        steps: [
          'Inhale through the nose for 3 counts.',
          'Exhale through the mouth for 5–6 counts.',
          'Drop the shoulders on the exhale.',
          'Repeat 8–10 cycles.',
        ],
      },
      sl: {
        title: 'Daljši izdih',
        when: 'Srce bije, dihanje je kratko, stavek se ne izide.',
        caution: 'Če se vam vrti, dihajte, kakor zmorete, brez zadrževanja sape.',
        steps: [
          'Vdih skozi nos na 3 štetja.',
          'Izdih skozi usta na 5–6 štetij.',
          'Ob izdihu spustite ramena.',
          'Ponovite 8–10 ciklov.',
        ],
      },
    },
  },
  {
    id: 'pause-stop',
    school: 'dbt',
    situations: ['anger', 'urge', 'conflict', 'crisis'],
    durationMin: 2,
    intensity: 'crisis',
    copy: {
      ru: {
        title: 'Пауза до действия',
        when: 'Хочется сразу написать, ударить, уйти или сделать себе хуже.',
        caution: 'Это не «терпи бесконечно». Это 90 секунд, чтобы выбрать следующий шаг.',
        steps: [
          'Стоп: замрите, ноги на полу.',
          'Один полный выдох.',
          'Заметьте: что в теле, какая мысль, какой позыв.',
          'Выберите одно маленькое следующее действие, не худшее.',
        ],
      },
      en: {
        title: 'Pause before acting',
        when: 'You want to send the message, slam the door, leave, or hurt yourself right now.',
        caution: 'This is not endless endurance. It is 90 seconds to choose the next step.',
        steps: [
          'Stop: freeze, feet on the floor.',
          'One full exhale.',
          'Notice: body, thought, urge.',
          'Pick one small next action that is not the worst one.',
        ],
      },
      sl: {
        title: 'Premor pred dejanjem',
        when: 'Radi bi takoj napisali, udarili, odšli ali si naredili slabo.',
        caution: 'To ni neskončno prenašanje. To je 90 sekund, da izberete naslednji korak.',
        steps: [
          'Stop: obstanite, noge na tleh.',
          'En poln izdih.',
          'Opazite: telo, misel, impulz.',
          'Izberite eno majhno naslednje dejanje, ki ni najslabše.',
        ],
      },
    },
  },
  {
    id: 'body-first',
    school: 'dbt',
    situations: ['panic', 'anger', 'urge', 'crisis'],
    durationMin: 5,
    intensity: 'mid',
    copy: {
      ru: {
        title: 'Сначала тело',
        when: 'Эмоция уже выше разговора. Слова не доходят.',
        caution: 'Холодная вода не подходит при проблемах с сердцем. Интенсив не подходит, если тело нельзя нагружать. Тогда только выдох.',
        steps: [
          'Холод: умойте лицо прохладной водой или подержите что-то холодное.',
          'Или 60–90 секунд быстро походите / поприседайте, если это безопасно.',
          'Затем 8 длинных выдохов.',
          'Только потом решайте, что делать дальше.',
        ],
      },
      en: {
        title: 'Body first',
        when: 'The emotion is already louder than conversation. Words do not land.',
        caution: 'Cold water is a bad fit with heart issues. Intense movement is a bad fit if your body cannot take load. Then use the exhale only.',
        steps: [
          'Cold: rinse your face or hold something cool.',
          'Or walk / squat for 60–90 seconds if that is safe.',
          'Then take 8 long exhales.',
          'Only then choose the next step.',
        ],
      },
      sl: {
        title: 'Najprej telo',
        when: 'Čustvo je že glasnejše od pogovora. Besede ne pridejo skozi.',
        caution: 'Hladna voda ni primerna ob težavah s srcem. Intenzivna vadba ni primerna, če telesa ni mogoče obremeniti. Tedaj samo izdih.',
        steps: [
          'Hladno: umijte obraz ali držite nekaj hladnega.',
          'Ali 60–90 sekund hitro hodite / počepajte, če je to varno.',
          'Nato 8 dolgih izdihov.',
          'Šele potem izberite naslednji korak.',
        ],
      },
    },
  },
  {
    id: 'name-emotion',
    school: 'dbt',
    situations: ['anger', 'shame', 'panic', 'numb'],
    durationMin: 3,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Назвать чувство',
        when: 'Внутри ком, а слова только «плохо» или «всё достало».',
        caution: 'Не нужно искать «правильное» название. Первое подходящее достаточно.',
        steps: [
          'Где в теле это живёт?',
          'Подберите слово: страх, злость, стыд, грусть, вина, пустота, смесь.',
          'Скажите: «Сейчас во мне есть …».',
          'Добавьте силу от 0 до 10. Не исправляйте, просто заметьте.',
        ],
      },
      en: {
        title: 'Name the feeling',
        when: 'There is a knot inside, and the only words are “bad” or “enough”.',
        caution: 'You do not need the perfect label. The first decent word is enough.',
        steps: [
          'Where does this live in the body?',
          'Pick a word: fear, anger, shame, sadness, guilt, emptiness, a mix.',
          'Say: “Right now there is … in me.”',
          'Add intensity from 0 to 10. Do not fix it. Just notice.',
        ],
      },
      sl: {
        title: 'Poimenovati občutek',
        when: 'Znotraj je vozel, besede pa so samo »slabo« ali »dovolj je«.',
        caution: 'Ni treba iskati popolnega imena. Prva primerna beseda zadošča.',
        steps: [
          'Kje v telesu to živi?',
          'Izberite besedo: strah, jeza, sram, žalost, krivda, praznina, mešanica.',
          'Recite: »Zdaj je v meni …«.',
          'Dodajte moč od 0 do 10. Ne popravljajte, samo opazite.',
        ],
      },
    },
  },
  {
    id: 'opposite-action',
    school: 'dbt',
    situations: ['numb', 'shame', 'anger', 'urge'],
    durationMin: 8,
    intensity: 'mid',
    copy: {
      ru: {
        title: 'Шаг наоборот',
        when: 'Хочется спрятаться, напасть или ничего не делать — и это уже кормит проблему.',
        caution: 'Не наоборот к реальной опасности. Если небезопасно — уходите и зовите помощь.',
        steps: [
          'Какой позыв самый сильный прямо сейчас?',
          'Какое маленькое действие смотрит в другую сторону?',
          'Сделайте его на 2–5 минут, не на весь день.',
          'После — одна фраза: что изменилось на 1 балл, если изменилось.',
        ],
      },
      en: {
        title: 'A step the other way',
        when: 'The urge is to hide, attack, or do nothing — and that already feeds the problem.',
        caution: 'Do not do the opposite of real danger. If it is unsafe, leave and get help.',
        steps: [
          'What is the strongest urge right now?',
          'What tiny action faces the other way?',
          'Do it for 2–5 minutes, not the whole day.',
          'Then one sentence: what shifted by 1 point, if anything.',
        ],
      },
      sl: {
        title: 'Korak v drugo smer',
        when: 'Želja je skriti se, napasti ali ne narediti nič — in to že hrani težavo.',
        caution: 'Ne v nasprotno smer ob resnični nevarnosti. Če ni varno, odidite in poiščite pomoč.',
        steps: [
          'Kateri impulz je zdaj najmočnejši?',
          'Katero majhno dejanje gleda v drugo smer?',
          'Naredite ga 2–5 minut, ne cel dan.',
          'Nato en stavek: kaj se je spremenilo za 1 točko, če se je.',
        ],
      },
    },
  },
  {
    id: 'triangle',
    school: 'cbt',
    situations: ['rumination', 'shame', 'panic'],
    durationMin: 6,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Треугольник',
        when: 'Кажется, что «так и есть», а на деле сцепились мысль, чувство и дело.',
        caution: 'Не спорьте с травматическим воспоминанием в одиночку. Тогда заземление и специалист.',
        steps: [
          'Ситуация в одной строке, без оценки.',
          'Мысль, которая пришла.',
          'Чувство и что сделали / захотели сделать.',
          'Где можно чуть изменить одно звено — мысль или крошечное действие.',
        ],
      },
      en: {
        title: 'The triangle',
        when: 'It feels like “this is how it is”, but a thought, a feeling, and an action have locked together.',
        caution: 'Do not argue with a traumatic memory alone. Then use grounding and a specialist.',
        steps: [
          'The situation in one line, no verdict.',
          'The thought that arrived.',
          'The feeling and what you did / wanted to do.',
          'Where could one link shift a little — the thought or a tiny action.',
        ],
      },
      sl: {
        title: 'Trikotnik',
        when: 'Zdi se, da »tako pač je«, v resnici pa so se spojili misel, občutek in dejanje.',
        caution: 'Ne prepirajte se sami s travmatičnim spominom. Tedaj ozemljitev in strokovnjak.',
        steps: [
          'Situacija v eni vrstici, brez sodbe.',
          'Misel, ki je prišla.',
          'Občutek in kaj ste naredili / želeli narediti.',
          'Kje lahko malce premaknete en člen — misel ali drobno dejanje.',
        ],
      },
    },
  },
  {
    id: 'thought-fact',
    school: 'cbt',
    situations: ['rumination', 'shame', 'conflict'],
    durationMin: 7,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Мысль или факт',
        when: 'Голова выдаёт приговор, будто это уже доказано.',
        caution: 'Не для острого психоза и не для «переспорить» травму. Тогда пауза и опора.',
        steps: [
          'Запишите мысль дословно.',
          'Что здесь наблюдаемый факт?',
          'Какое ещё объяснение возможно, даже на 10%?',
          'Какое действие следует из более мягкой версии, не из приговора.',
        ],
      },
      en: {
        title: 'Thought or fact',
        when: 'The mind delivers a verdict as if it were already proven.',
        caution: 'Not for acute psychosis and not for arguing with trauma. Then pause and ground.',
        steps: [
          'Write the thought word for word.',
          'What here is an observed fact?',
          'What other explanation is possible, even at 10%?',
          'What action follows from the kinder version, not from the verdict.',
        ],
      },
      sl: {
        title: 'Misel ali dejstvo',
        when: 'Glava izreče sodbo, kakor da je že dokazana.',
        caution: 'Ne ob akutni psihozi in ne za prepir s travmo. Tedaj premor in opora.',
        steps: [
          'Zapišite misel dobesedno.',
          'Kaj tukaj je opazovano dejstvo?',
          'Katera druga razlaga je mogoča, čeprav za 10 %?',
          'Katero dejanje sledi iz mehkejše različice, ne iz sodbe.',
        ],
      },
    },
  },
  {
    id: 'one-action',
    school: 'behavioral',
    situations: ['numb', 'shame', 'insomnia'],
    durationMin: 10,
    intensity: 'mid',
    copy: {
      ru: {
        title: 'Одно маленькое дело',
        when: 'Нет сил на жизнь, но лежание уже не восстанавливает.',
        caution: 'Это не «возьми себя в руки». Дело должно быть крошечным и конкретным.',
        steps: [
          'Выберите дело на 2–10 минут: стакан воды, открыть окно, выйти в подъезд.',
          'Сделайте только его.',
          'Отметьте: настроение до и после, хотя бы примерно.',
          'Если не вышло — уменьшите дело вдвое, не ругайте себя.',
        ],
      },
      en: {
        title: 'One small task',
        when: 'There is no energy for life, but lying still is not restoring you either.',
        caution: 'This is not “pull yourself together”. The task must be tiny and concrete.',
        steps: [
          'Pick a 2–10 minute task: a glass of water, open a window, step outside.',
          'Do only that.',
          'Note mood before and after, even roughly.',
          'If it did not happen, cut the task in half. Do not scold yourself.',
        ],
      },
      sl: {
        title: 'Eno majhno opravilo',
        when: 'Ni moči za življenje, a ležanje tudi ne povrne sil.',
        caution: 'To ni »vzemi se v roke«. Opravilo mora biti drobno in konkretno.',
        steps: [
          'Izberite opravilo za 2–10 minut: kozarec vode, odpreti okno, stopiti ven.',
          'Naredite samo to.',
          'Zabeležite razpoloženje pred in po, čeprav približno.',
          'Če ni šlo, prepolovite opravilo. Ne grajajte se.',
        ],
      },
    },
  },
  {
    id: 'notice-thought',
    school: 'act',
    situations: ['rumination', 'shame', 'panic'],
    durationMin: 4,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Я замечаю мысль',
        when: 'Мысль приклеилась и притворяется голосом правды.',
        caution: 'Не цель «очистить ум». Цель — чуть отклеиться.',
        steps: [
          'Поймайте фразу, которая крутится.',
          'Скажите: «Я замечаю мысль, что …».',
          'Ещё раз, медленнее.',
          'Вернитесь к одному якорю: стопы, выдох, предмет в руке.',
        ],
      },
      en: {
        title: 'I notice the thought',
        when: 'A thought has stuck and pretends to be the voice of truth.',
        caution: 'The goal is not a clear mind. The goal is a little unsticking.',
        steps: [
          'Catch the sentence that loops.',
          'Say: “I notice the thought that …”.',
          'Once more, slower.',
          'Return to one anchor: feet, exhale, an object in the hand.',
        ],
      },
      sl: {
        title: 'Opazim misel',
        when: 'Misel se je prilepila in se pretvarja, da je glas resnice.',
        caution: 'Cilj ni prazen um. Cilj je malo odlepljenja.',
        steps: [
          'Ujemite stavek, ki se vrti.',
          'Recite: »Opazim misel, da …«.',
          'Še enkrat, počasneje.',
          'Vrnite se k enemu sidru: stopala, izdih, predmet v roki.',
        ],
      },
    },
  },
  {
    id: 'three-values',
    school: 'act',
    situations: ['numb', 'shame', 'conflict'],
    durationMin: 8,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Три стороны жизни',
        when: 'Всё сузилось до симптомов, и непонятно, ради чего стараться.',
        caution: 'Ценности — не цели на год и не стыд «я должен быть лучше».',
        steps: [
          'Выберите три стороны: тело, близкие, дело / учёба, творчество, дом.',
          'Для каждой — одно слово, каким человеком хотите быть.',
          'Одно крошечное действие на сегодня в одной стороне.',
          'Сделайте его или запишите на неделю.',
        ],
      },
      en: {
        title: 'Three sides of life',
        when: 'Everything has narrowed to symptoms, and it is unclear what is worth the effort.',
        caution: 'Values are not yearly goals and not shame about who you should be.',
        steps: [
          'Pick three sides: body, people, work / study, making, home.',
          'For each, one word for the person you want to be.',
          'One tiny action today on one side.',
          'Do it, or put it on this week.',
        ],
      },
      sl: {
        title: 'Tri strani življenja',
        when: 'Vse se je zožilo na simptome in ni jasno, zakaj se truditi.',
        caution: 'Vrednote niso cilji za leto in ne sram, kakšni bi »morali« biti.',
        steps: [
          'Izberite tri strani: telo, bližnji, delo / študij, ustvarjanje, dom.',
          'Za vsako eno besedo, kakšna oseba želite biti.',
          'Eno drobno dejanje danes na eni strani.',
          'Naredite ga ali ga zapišite za teden.',
        ],
      },
    },
  },
  {
    id: 'worry-window',
    school: 'cbt',
    situations: ['rumination', 'insomnia', 'panic'],
    durationMin: 12,
    intensity: 'mid',
    copy: {
      ru: {
        title: 'Окно для тревоги',
        when: 'Беспокойство ест день и ночь без остановки.',
        caution: 'Если тревога про опасность прямо сейчас — действуйте, не откладывайте.',
        steps: [
          'Выберите 15 минут позже сегодня, не в кровати.',
          'До окна запишите тревогу одной строкой и скажите: «вернусь в …».',
          'В окне выпишите всё, затем отметьте: могу влиять / не могу.',
          'Для «могу» — один шаг. Для «не могу» — выдох и закрыть тетрадь.',
        ],
      },
      en: {
        title: 'A window for worry',
        when: 'Worry eats the day and the night without a stop.',
        caution: 'If the worry is about danger right now, act. Do not postpone that.',
        steps: [
          'Pick 15 minutes later today, not in bed.',
          'Until then, write the worry in one line and say: “I’ll come back at …”.',
          'In the window, dump it all, then mark: I can influence / I cannot.',
          'For “can” — one step. For “cannot” — an exhale and close the notebook.',
        ],
      },
      sl: {
        title: 'Okno za skrb',
        when: 'Skrb žre dan in noč brez prestanka.',
        caution: 'Če gre za nevarnost prav zdaj, ukrepajte. Tega ne odlašajte.',
        steps: [
          'Izberite 15 minut pozneje danes, ne v postelji.',
          'Do okna zapišite skrb v eni vrstici in recite: »vrnil/a se bom ob …«.',
          'V oknu izpišite vse, nato označite: lahko vplivam / ne morem.',
          'Za »lahko« — en korak. Za »ne morem« — izdih in zaprite zvezek.',
        ],
      },
    },
  },
  {
    id: 'kind-friend',
    school: 'cft',
    situations: ['shame', 'numb', 'rumination'],
    durationMin: 5,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Как доброму человеку',
        when: 'Внутри судья, а усталость уже и так есть.',
        caution: 'Если доброта к себе вызывает ярость — не форсируйте. Вернитесь к телу.',
        steps: [
          'Вспомните, что бы сказали усталому знакомому в той же ситуации.',
          'Скажите это себе вслух, даже если звучит фальшиво.',
          'Положите ладонь на грудь или щеку, если это переносимо.',
          'Два минуты медленного выдоха в этом жесте.',
        ],
      },
      en: {
        title: 'As to a kind person',
        when: 'There is a judge inside, and the tiredness is already there.',
        caution: 'If kindness toward yourself turns into rage, do not force it. Return to the body.',
        steps: [
          'What would you say to a tired friend in the same situation?',
          'Say that to yourself out loud, even if it sounds fake.',
          'A hand on the chest or cheek, if that is tolerable.',
          'Two minutes of slow exhale in that gesture.',
        ],
      },
      sl: {
        title: 'Kot prijaznemu človeku',
        when: 'Znotraj je sodnik, utrujenost pa je že tukaj.',
        caution: 'Če prijaznost do sebe zbudi jezo, ne silite. Vrnite se k telesu.',
        steps: [
          'Kaj bi rekli utrujenemu znanemu v isti situaciji?',
          'To recite sebi na glas, tudi če zveni lažno.',
          'Dlan na prsi ali lice, če je to prenosljivo.',
          'Dve minuti počasnega izdiha v tej gesti.',
        ],
      },
    },
  },
  {
    id: 'same-morning',
    school: 'behavioral',
    situations: ['insomnia', 'numb'],
    durationMin: 5,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Тот же подъём',
        when: 'Ночь рваная, день плывёт, кровать уже не про сон.',
        caution: 'Не начинайте с жёсткого ограничения сна без специалиста, если вы истощены.',
        steps: [
          'Выберите время подъёма и держите его, даже после плохой ночи.',
          'Свет и несколько шагов в первые 15 минут.',
          'В кровать — когда сонливо, не «уже полночь, надо».',
          'Если не спится 20 минут — встаньте и вернитесь сонным, без телефона в лице.',
        ],
      },
      en: {
        title: 'The same wake time',
        when: 'The night is broken, the day drifts, and bed is no longer for sleep.',
        caution: 'Do not start hard sleep restriction alone if you are depleted.',
        steps: [
          'Pick a wake time and keep it, even after a bad night.',
          'Light and a few steps in the first 15 minutes.',
          'Go to bed when sleepy, not because “it is already midnight”.',
          'If you are awake 20 minutes, get up and return when sleepy, no phone in the face.',
        ],
      },
      sl: {
        title: 'Isti čas vstajanja',
        when: 'Noč je raztrgana, dan plava, postelja ni več za spanje.',
        caution: 'Ne začenjajte ostre omejitve spanja sami, če ste izčrpani.',
        steps: [
          'Izberite uro vstajanja in jo držite, tudi po slabi noči.',
          'Svetloba in nekaj korakov v prvih 15 minutah.',
          'V posteljo, ko ste zaspani, ne ker »je že polnoč«.',
          'Če 20 minut ne spite, vstanite in se vrnite zaspani, brez telefona v obraz.',
        ],
      },
    },
  },
  {
    id: 'ask-clearly',
    school: 'dbt',
    situations: ['conflict', 'shame', 'anger'],
    durationMin: 10,
    intensity: 'mid',
    copy: {
      ru: {
        title: 'Сказать прямо и коротко',
        when: 'Нужно попросить или отказать, а внутри либо взрыв, либо исчезновение.',
        caution: 'Не для разговора с человеком, от которого исходит насилие. Тогда безопасность важнее фразы.',
        steps: [
          'Факт: что произошло, без ярлыков.',
          'Чувство: «мне тревожно / обидно / тесно».',
          'Просьба: одно конкретное «хочу, чтобы …».',
          'Если нет — короткий отказ без объяснения на три страницы.',
        ],
      },
      en: {
        title: 'Say it short and clear',
        when: 'You need to ask or refuse, and inside it is either an explosion or disappearing.',
        caution: 'Not for a conversation with someone violent. Then safety beats the phrase.',
        steps: [
          'Fact: what happened, no labels.',
          'Feeling: “I feel anxious / hurt / cramped”.',
          'Ask: one concrete “I want …”.',
          'If the answer is no — a short refusal, not a three-page defence.',
        ],
      },
      sl: {
        title: 'Povedati kratko in jasno',
        when: 'Treba je prositi ali zavrniti, znotraj pa je ali izbruh ali izginotje.',
        caution: 'Ne za pogovor s človekom, od katerega prihaja nasilje. Tedaj je varnost pred stavkom.',
        steps: [
          'Dejstvo: kaj se je zgodilo, brez nalepk.',
          'Občutek: »tesnobno mi je / žaljeno / tesno«.',
          'Prošnja: eno konkretno »želim, da …«.',
          'Če ne gre — kratka zavrnitev, ne obramba na treh straneh.',
        ],
      },
    },
  },
  {
    id: 'wise-mind',
    school: 'mindfulness',
    situations: ['conflict', 'urge', 'rumination'],
    durationMin: 4,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Ум и тело вместе',
        when: 'Либо ледяная логика без чувств, либо чувства без берега.',
        caution: 'Не медитация на 40 минут. Если диссоциация растёт — откройте глаза и заземлитесь.',
        steps: [
          'Заметьте «рациональный» голос и «эмоциональный».',
          'Спросите: чего я хочу на этой неделе, не в эту секунду?',
          'Один вдох в живот, один выдох.',
          'Сформулируйте один шаг, который учитывает и факт, и чувство.',
        ],
      },
      en: {
        title: 'Mind and body together',
        when: 'It is either icy logic without feeling, or feeling with no shore.',
        caution: 'This is not a 40-minute meditation. If dissociation grows, open your eyes and ground.',
        steps: [
          'Notice the “rational” voice and the “emotional” one.',
          'Ask: what do I want this week, not in this second?',
          'One breath into the belly, one exhale.',
          'Name one step that holds both the fact and the feeling.',
        ],
      },
      sl: {
        title: 'Um in telo skupaj',
        when: 'Ali ledena logika brez občutka, ali občutek brez brega.',
        caution: 'To ni 40-minutna meditacija. Če disociacija raste, odprite oči in se ozemljite.',
        steps: [
          'Opazite »racionalni« glas in »čustvenega«.',
          'Vprašajte: kaj želim ta teden, ne v tej sekundi?',
          'En vdih v trebuh, en izdih.',
          'Izrazite en korak, ki upošteva dejstvo in občutek.',
        ],
      },
    },
  },
  {
    id: 'five-senses-soothe',
    school: 'dbt',
    situations: ['insomnia', 'shame', 'panic'],
    durationMin: 6,
    intensity: 'calm',
    copy: {
      ru: {
        title: 'Пять чувств мягче',
        when: 'Нужно снизить оборот, не решая жизнь целиком.',
        caution: 'Выбирайте то, что реально доступно. Не покупайте ритуал.',
        steps: [
          'Зрение: приглушить свет или посмотреть на что-то спокойное.',
          'Слух: тихий звук, не новости.',
          'Осязание: плед, тёплая кружка, прохладный пол под стопами.',
          'Запах и вкус: один глоток, один вдох. Без оценки «помогло или нет» первые две минуты.',
        ],
      },
      en: {
        title: 'Five senses, softer',
        when: 'You need to lower the revs without solving the whole life.',
        caution: 'Pick what is actually available. Do not buy a ritual.',
        steps: [
          'Sight: dim the light or look at something quiet.',
          'Sound: a low sound, not the news.',
          'Touch: a blanket, a warm mug, a cool floor under the feet.',
          'Smell and taste: one sip, one inhale. No verdict for the first two minutes.',
        ],
      },
      sl: {
        title: 'Pet čutov, mehkeje',
        when: 'Treba je znižati vrtljaje, ne rešiti celega življenja.',
        caution: 'Izberite, kar je res dosegljivo. Ne kupujte rituala.',
        steps: [
          'Vid: potemnete luč ali pogledate nekaj mirnega.',
          'Sluh: tih zvok, ne novice.',
          'Dotik: odeja, topel lonček, hladen tla pod stopali.',
          'Vonj in okus: en požirek, en vdih. Prvi dve minuti brez sodbe »je pomagalo ali ne«.',
        ],
      },
    },
  },
  {
    id: 'ride-the-wave',
    school: 'act',
    situations: ['urge', 'anger', 'crisis'],
    durationMin: 8,
    intensity: 'mid',
    copy: {
      ru: {
        title: 'Переждать волну',
        when: 'Позыв кажется вечным, хотя тело обычно держит пик несколько минут.',
        caution: 'Если вы в опасности — не «переживайте волну», зовите помощь. Это про позыв, не про оставаться в угрозе.',
        steps: [
          'Скажите: «это волна, она поднимается».',
          'Не спорьте и не выполняйте позыв. Следите за дыханием и стопами.',
          'Оцените силу каждую минуту от 0 до 10.',
          'Когда спадёт хотя бы на 1–2 балла — выберите следующее неразрушающее действие.',
        ],
      },
      en: {
        title: 'Ride the wave',
        when: 'The urge feels endless, though the body usually holds the peak for a few minutes.',
        caution: 'If you are in danger, do not “ride the wave” — get help. This is about an urge, not staying in threat.',
        steps: [
          'Say: “this is a wave, it is rising.”',
          'Do not argue and do not act on the urge. Watch the breath and the feet.',
          'Rate the strength each minute from 0 to 10.',
          'When it drops by even 1–2 points, pick the next non-destructive action.',
        ],
      },
      sl: {
        title: 'Prejahanje vala',
        when: 'Impulz se zdi večen, čeprav telo vrh običajno drži le nekaj minut.',
        caution: 'Če ste v nevarnosti, ne »jahajte vala« — poiščite pomoč. To je o impulzu, ne o ostajanju v grožnji.',
        steps: [
          'Recite: »to je val, dviga se.«',
          'Ne prepirajte se in ne uresničite impulza. Spremljajte dih in stopala.',
          'Vsako minuto ocenite moč od 0 do 10.',
          'Ko pade vsaj za 1–2 točki, izberite naslednje dejanje, ki ne škodi.',
        ],
      },
    },
  },
]

export const crisisSkillIds = ['grounding', 'long-exhale', 'pause-stop'] as const

export function getTechnique(id: string) {
  return techniques.find((item) => item.id === id)
}
