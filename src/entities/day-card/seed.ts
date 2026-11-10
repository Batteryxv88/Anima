import { emptyLocalized, type DayCard, type DayCardField, type DayCardLocalized } from './model'

function ru(text: string): DayCardLocalized {
  return { ru: text, en: text, sl: text }
}

function field(
  id: string,
  kind: DayCardField['kind'],
  label: string,
  extra: Partial<DayCardField> = {},
): DayCardField {
  return {
    id,
    kind,
    label: ru(label),
    ...extra,
  }
}

export function defaultDistressDayCard(): DayCard {
  return {
    id: 'distressTolerance',
    school: 'dbt',
    cadence: 'daily',
    active: false,
    order: 0,
    techniqueIds: [],
    copy: {
      ru: {
        title: 'Стрессоустойчивость',
        about:
          'Тренажёр на день: утром выбрать круг, днём коротко записать, что сработало, вечером закрепить без критики. Утро не обязательно — можно начать с одной строки, когда накрыло.',
      },
      en: { title: '', about: '' },
      sl: { title: '', about: '' },
    },
    sections: [
      {
        id: 'morning',
        kind: 'fields',
        title: ru('Утро'),
        hint: ru(
          'Как настроить навигатор перед поездкой. Какие сложные ситуации могут случиться сегодня? Какой один навык ACCEPTS и один IMPROVE попробуете в первую очередь.',
        ),
        fields: [
          field('situation1', 'textarea', 'Ситуация 1'),
          field('situation2', 'textarea', 'Ситуация 2'),
          field('acceptsPick', 'skill', 'ACCEPTS на сегодня'),
          field('improvePick', 'skill', 'IMPROVE на сегодня'),
        ],
      },
      {
        id: 'day',
        kind: 'repeater',
        title: ru('День'),
        hint: ru(
          'Когда напряжение от 4 до 8 из 10. Цифра и одно слово — достаточно. Лучше каракули сразу, чем идеальный почерк вечером.',
        ),
        fields: [
          field('stressBefore', 'scale', 'Стресс до', { min: 0, max: 10, spotlight: true }),
          field('skill', 'skill', 'Какое упражнение', { spotlight: true }),
          field('action', 'textarea', 'Что конкретно я сделал(а)', { spotlight: true }),
          field('stressAfter', 'scale', 'Стресс после', { min: 0, max: 10, spotlight: true }),
          field('trigger', 'text', 'Время / триггер'),
          field('noticed', 'textarea', 'Что я заметил(а)'),
        ],
      },
      {
        id: 'evening',
        kind: 'fields',
        title: ru('Вечер'),
        hint: ru(
          'Закрепить успех без критики. Пустые графы — это информация, не провал. Если за день ничего не записали — честно напишите, почему.',
        ),
        fields: [
          field('win', 'textarea', 'Главная победа дня — каким действием я горжусь, даже крошечным'),
          field('experiment', 'textarea', 'Какой навык сработал не так, как я ожидал(а)'),
          field('nextTime', 'textarea', 'Что можно попробовать иначе в следующий раз'),
          field('meaning', 'textarea', 'Сегодняшний трудный день показал мне, что я умею…'),
          field('skippedBecause', 'textarea', 'Сегодня навыки не использовал(а), потому что…', {
            revealWhen: 'repeaterEmpty',
          }),
        ],
      },
    ],
  }
}

export { emptyLocalized }
