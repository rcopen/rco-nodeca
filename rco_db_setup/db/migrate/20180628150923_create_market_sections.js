'use strict';


exports.up = async function (N) {
  let config = [
    {
      title: 'Самолеты',
      hid: 1,
      children: [
        {
          title: 'Готовые самолеты и наборы',
          hid: 12
        },
        {
          title: 'Комплектующие для самолетов',
          hid: 13
        }
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Квадрокоптеры и другие',
      hid: 2,
      children: [
        {
          title: 'Готовые',
          hid: 14
        },
        {
          title: 'Рамы, наборы для сборки',
          hid: 15
        },
        {
          title: 'Контроллеры',
          hid: 16
        },
        {
          title: 'Комплектующие для квадрокоптеров',
          hid: 17
        }
      ],
      links: [
        'FPV-оборудование',
        'Комплектующие'
      ]
    },
    {
      title: 'Вертолеты',
      hid: 3,
      children: [
        {
          title: 'Микровертолеты (весом < 400г)',
          hid: 18
        },
        {
          title: 'Электрические вертолеты',
          hid: 19
        },
        {
          title: 'Вертолеты с ДВС',
          hid: 20
        },
        {
          title: 'Комплектующие для вертолетов',
          hid: 21
        }
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Авто, мото, танки',
      hid: 4,
      children: [
        {
          title: 'Шоссейные автомодели (в сборе)',
          hid: 22
        },
        {
          title: 'Автомодели off-road и монстры (в сборе)',
          hid: 23
        },
        {
          title: 'Танки',
          hid: 24
        },
        {
          title: 'Другие',
          hid: 25
        },
        {
          title: 'Комплектующие для авто',
          hid: 26,
          children: [
            {
              title: 'Кузова',
              hid: 41
            },
            {
              title: 'Колеса',
              hid: 42
            },
            {
              title: 'Шасси',
              hid: 43
            },
            {
              title: 'Тюнинг',
              hid: 44
            },
            {
              title: 'Другое',
              hid: 45
            }
          ]
        }
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Судомодели',
      hid: 5,
      children: [
        {
          title: 'Судомодели в сборе',
          hid: 27
        },
        {
          title: 'Комплектующие для судомоделей',
          hid: 28
        }
      ],
      links: [
        'Комплектующие'
      ]
    },
    {
      title: 'Другие модели',
      hid: 6,
      children: [
        {
          title: 'Ракеты',
          hid: 29
        },
        {
          title: 'Железные дороги',
          hid: 30
        },
        {
          title: 'Игрушки',
          hid: 31
        },
        {
          title: 'Остальное',
          hid: 32
        }
      ]
    },
    {
      title: 'Аппаратура радиоуправления',
      hid: 7,
      children: [
        {
          title: 'Передатчики и комплекты',
          hid: 33
        },
        {
          title: 'Приемники',
          hid: 34
        },
        {
          title: 'Рулевые машинки',
          hid: 35
        },
        {
          title: 'Остальное',
          hid: 36
        }
      ]
    },
    {
      title: 'Комплектующие',
      hid: 8,
      children: [
        {
          title: 'FPV-оборудование',
          hid: 37,
          children: [
            {
              title: 'Камеры, подвесы',
              hid: 46
            },
            {
              title: 'Видео-очки, шлемы',
              hid: 47
            },
            {
              title: 'Видео-линки и компоненты',
              hid: 48
            },
            {
              title: 'Остальное',
              hid: 49
            }
          ]
        },
        {
          title: 'Аккумуляторы',
          hid: 38
        },
        {
          title: 'Зарядные устройства и блоки питания',
          hid: 39
        },
        {
          title: 'Двигатели и аксессуары',
          hid: 40,
          children: [
            {
              title: 'Бесколлекторные двигатели и регуляторы',
              hid: 50
            },
            {
              title: 'Коллекторные двигатели и регуляторы',
              hid: 51
            },
            {
              title: 'Калильные двигатели, топливо и аксессуары',
              hid: 52
            },
            {
              title: 'Бензиновые двигатели  и аксессуары',
              hid: 53
            },
            {
              title: 'Турбины и аксессуары',
              hid: 54
            },
            {
              title: 'Остальное',
              hid: 55
            }
          ]
        }
      ]
    },
    {
      title: 'Инструмент, станки',
      hid: 9
    },
    {
      title: 'Не модельное',
      hid: 10
    },
    {
      title: 'Отдам в хорошие руки',
      hid: 11,
      allow_wishes: false,
      no_price: true
    }
  ];


  let sections_by_name = {};
  let sections_to_save = [];
  let links_to_resolve = [];

  function make_sections(section_array, parent) {
    let display_order = 0;

    for (let section_desc of section_array) {
      if (!section_desc.title) throw new Error('title is required: ' + JSON.stringify(section_desc));
      if (!section_desc.hid)   throw new Error('hid is required: ' + JSON.stringify(section_desc));

      let section = new N.models.market.Section({
        title:         section_desc.title,
        hid:           section_desc.hid,
        display_order: ++display_order,
        is_category:   !!section_desc.children
      });

      if (parent) section.parent = parent._id;
      if ('allow_offers' in section_desc) section.allow_offers = section_desc.allow_offers;
      if ('allow_wishes' in section_desc) section.allow_wishes = section_desc.allow_wishes;
      if ('no_price' in section_desc) section.no_price = section_desc.no_price;

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

  for (let section of sections_to_save) {
    if (await N.models.market.Section.findOne({ hid: section.hid })) {
      throw new Error(`Unable to save section '${section.title}': hid ${section.hid} already exists`);
    }
    await section.save();
  }

  await N.models.core.Increment.updateOne(
    { key: 'market_section' },
    { $set: { value: Math.max(0, ...sections_to_save.map(s => s.hid)) } },
    { upsert: true }
  );
};
