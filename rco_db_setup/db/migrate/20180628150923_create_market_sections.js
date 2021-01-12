'use strict';


exports.up = async function (N) {
  let config = [
    {
      title: 'Самолеты',
      children: [
        'Готовые самолеты и наборы',
        'Комплектующие для самолетов'
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Квадрокоптеры и другие',
      children: [
        'Готовые',
        'Рамы, наборы для сборки',
        'Контроллеры',
        'Комплектующие для квадрокоптеров'
      ],
      links: [
        'FPV-оборудование',
        'Комплектующие'
      ]
    },
    {
      title: 'Вертолеты',
      children: [
        'Микровертолеты (весом < 400г)',
        'Электрические вертолеты',
        'Вертолеты с ДВС',
        'Комплектующие для вертолетов'
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Авто, мото, танки',
      children: [
        'Шоссейные автомодели (в сборе)',
        'Автомодели off-road и монстры (в сборе)',
        'Танки',
        'Другие',
        {
          title: 'Комплектующие для авто',
          children: [
            'Кузова',
            'Колеса',
            'Шасси',
            'Тюнинг',
            'Другое'
          ]
        }
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Судомодели',
      children: [
        'Судомодели в сборе',
        'Комплектующие для судомоделей'
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Другие модели',
      children: [
        'Ракеты',
        'Железные дороги',
        'Игрушки',
        'Остальное'
      ]
    },
    {
      title: 'Аппаратура радиоуправления',
      children: [
        'Передатчики и комплекты',
        'Приемники',
        'Рулевые машинки',
        'Остальное'
      ]
    },
    {
      title: 'Комплектующие',
      children: [
        {
          title: 'FPV-оборудование',
          children: [
            'Камеры, подвесы',
            'Видео-очки, шлемы',
            'Видео-линки и компоненты',
            'Остальное'
          ]
        },
        'Аккумуляторы',
        'Зарядные устройства и блоки питания',
        {
          title: 'Двигатели и аксессуары',
          children: [
            'Бесколлекторные двигатели и регуляторы',
            'Коллекторные двигатели и регуляторы',
            'Калильные двигатели, топливо и аксессуары',
            'Бензиновые двигатели  и аксессуары',
            'Турбины и аксессуары',
            'Остальное'
          ]
        }
      ]
    },
    'Инструмент, станки',
    'Не модельное',
    {
      title: 'Отдам в хорошие руки',
      allow_wishes: false
    }
  ];


  let sections_by_name = {};
  let sections_to_save = [];
  let links_to_resolve = [];

  function make_sections(section_array, parent) {
    let display_order = 0;

    for (let section_desc of section_array) {
      if (typeof section_desc === 'string') section_desc = { title: section_desc };

      let section = new N.models.market.Section({
        title:         section_desc.title,
        display_order: ++display_order,
        is_category:   !!section_desc.children
      });

      if (parent) section.parent = parent._id;
      if ('allow_offers' in section_desc) section.allow_offers = section_desc.allow_offers;
      if ('allow_wishes' in section_desc) section.allow_wishes = section_desc.allow_wishes;

      if (!sections_by_name[section_desc.title]) {
        sections_by_name[section_desc.title] = section;
      }

      sections_to_save.push(section);

      if (section_desc.links) {
        links_to_resolve.push([ section, section_desc.links ]);
      }

      make_sections(section_desc.children || [], section);
    }
  }

  make_sections(config);

  for (let [ section, links ] of links_to_resolve) {
    section.links = links.map(title => {
      if (!sections_by_name[title]) throw new Error('Unknown link: ' + title);

      return sections_by_name[title]._id;
    });
  }

  for (let section of sections_to_save) await section.save();
};
