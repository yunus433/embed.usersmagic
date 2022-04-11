const defaultDemoData = {
  company: {
    _id: '6186b5ae4c86d13d62a88a90',
    name: 'ShoesMagic',
    country: 'tr',
    is_on_waitlist: false,
    waiting_domain: null,
    domain: 'https://usersmagic.com/',
    integration_paths: [
      {
        _id: '61fd1748fbdd7a89bc29fc0d',
        signature: '6186b5ae4c86d13d62a88a90kaydol_sayfası',
        company_id: '6186b5ae4c86d13d62a88a90',
        type: 'page',
        name: 'Kaydol Sayfası',
        path: '/register',
        product_id: null
      },
      {
        _id: '61fd401ba310aacbf48999a4',
        signature: '6186b5ae4c86d13d62a88a90z-10_-_product_page',
        company_id: '6186b5ae4c86d13d62a88a90',
        type: 'product',
        name: 'Z-10 - Product Page',
        path: '/shoes?id=61fd401ba310aacbf48999a1',
        product_id: '61fd401ba310aacbf48999a1'
      },
      {
        _id: '61fe5b33c64d585b00b321d4',
        signature: '6186b5ae4c86d13d62a88a90y-12_-_product_page',
        company_id: '6186b5ae4c86d13d62a88a90',
        type: 'product',
        name: 'Y-12 - Product Page',
        path: '/shoes?id=61fe5b33c64d585b00b321d1',
        product_id: '61fe5b33c64d585b00b321d1'
      }
    ],
    preferred_language: 'tr',
    preferred_color: 'rgba(140, 212, 224, 1)'
  },
  products: [
    {
      _id: '61fd401ba310aacbf48999a1',
      company_id: '6186b5ae4c86d13d62a88a90',
      name: 'Z-10 / Kırmızı Klasik',
      link: 'https://usersmagic.s3.amazonaws.com/1225486e404e0d02afb1591f81c8baaf'
    },
    {
      _id: '61fe5b33c64d585b00b321d1',
      company_id: '6186b5ae4c86d13d62a88a90',
      name: 'Y-12 / Mavi Spor',
      link: 'https://usersmagic.s3.amazonaws.com/fd9f76556746e8b4cfcc00d96054c052'
    }
  ],
  ads: [
    {
      _id: '623ac64c0bab194dd5b73b14',
      company_id: '6186b5ae4c86d13d62a88a90',
      order_number: 0,
      name: 'Z-10 / Kırmızı Klasik',
      title: 'Z-10 / Kırmızı Klasik Modelinde %10 Indirim!',
      text: 'Z-10 / Kırmızı Klasik ürününde sana özel %10 indirim koduna ulaşmak için tıkla.',
      button_text: 'Git',
      button_url: 'https://usersmagic.s3.amazonaws.com/1225486e404e0d02afb1591f81c8baaf',
      image_url: 'https://usersmagic.s3.amazonaws.com/1225486e404e0d02afb1591f81c8baaf',
      is_active: true,
      created_at: '23.03.2022',
      statistics: {
        total: 15703,
        showed: 5032,
        closed: 1132,
        clicked: 9539
      },
      integration_path_id_list: [
        '61fd401ba310aacbf48999a4'
      ],
    },
    {
      _id: '623ac64c0bab194dd5b73b15',
      company_id: '6186b5ae4c86d13d62a88a90',
      order_number: 0,
      name: 'Y-12 / Mavi Spor',
      title: 'Y-12 / Mavi Spor Modelinde %10 Indirim!',
      text: 'Y-12 / Mavi Spor ürününde sana özel %10 indirim koduna ulaşmak için tıkla.',
      button_text: 'Git',
      button_url: 'https://usersmagic.s3.amazonaws.com/fd9f76556746e8b4cfcc00d96054c052',
      image_url: 'https://usersmagic.s3.amazonaws.com/fd9f76556746e8b4cfcc00d96054c052',
      is_active: true,
      created_at: '02.04.2022',
      statistics: {
        total: 10273,
        showed: 4034,
        closed: 1023,
        clicked: 5036
      },
      integration_path_id_list: [
        '61fe5b33c64d585b00b321d4'
      ],
    }
  ],
  target_groups: [
    {
      _id: '6210e7f20fbe5b32f87b62c1',
      company_id: '6186b5ae4c86d13d62a88a90',
      name: 'Z-10 Reklam Kitlesi',
      description: 'Z-10 ayakkabı modeli için oluşturulan reklam kitlesi.',
      filters: [
        {
          name: 'Cinsiyet',
          allowed_answers: ['Erkek'],
          collected_data: {
            match: 21282,
            total: 30403
          },
          global_data: {
            match: 45340,
            total: 94233
          }
        },
        {
          name: 'Renk Tercihi / Genel',
          allowed_answers: ['Kırmızı'],
          collected_data: {
            match: 13203,
            total: 40542
          },
          global_data: {
            match: 23494,
            total: 68472
          }
        },
        {
          name: 'Beklenen Ayakkabı Alma Zamanı',
          allowed_answers: 'Bu hafta / 2 hafta içinde',
          collected_data: {
            match: 13838,
            total: 23933
          },
          global_data: {
            match: 15202,
            total: 27541
          }
        }
      ],
      estimated_people_count: {
        collected_data: 18034,
        global_data: 20677
      }
    },
    {
      _id: '6235a5ef6f7d6bf9f81238d2',
      company_id: '6186b5ae4c86d13d62a88a90',
      name: 'Y-12 Reklam Kitlesi',
      description: 'Y-12 ayakkabı modeli için oluşturulan reklam kitlesi.',
      filters: [
        {
          name: 'Cinsiyet',
          allowed_answers: ['Erkek'],
          collected_data: {
            match: 21282,
            total: 30403
          },
          global_data: {
            match: 45340,
            total: 94233
          }
        },
        {
          name: 'Renk Tercihi / Genel',
          allowed_answers: ['Mavi'],
          collected_data: {
            match: 10288,
            total: 40542
          },
          global_data: {
            match: 9238,
            total: 68472
          }
        },
        {
          name: 'Beklenen Ayakkabı Alma Zamanı',
          allowed_answers: 'Bu hafta / 2 hafta içinde',
          collected_data: {
            match: 13838,
            total: 23933
          },
          global_data: {
            match: 15202,
            total: 27541
          }
        }
      ],
      estimated_people_count: {
        collected_data: 12044,
        global_data: 13199
      }
    }
  ],
  questions: [
    {
      _id: '618e2556c619bb9c6abf817f',
      template_id: '6187767479dee623cf96f64f',
      timeout_duration_in_week: 520,
      order_number: 0,
      name: 'Cinsiyet',
      text: 'Cinsiyetiniz nedir?',
      type: 'demographics',
      subtype: 'single',
      choices: [ 'Kadın', 'Erkek', 'Diğer', 'Söylemeyi tercih etmiyorum' ],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '618e25b0d19a51578c04c219',
      template_id: '618e245de19a51578c04c1e0',
      timeout_duration_in_week: 52,
      order_number: 1,
      name: 'Renk tercihi / Genel',
      text: 'Aşağıdaki renklerden hangisini tercih edersiniz?',
      type: 'demographics',
      subtype: 'single',
      choices: ['🔵 Mavi', '🔴 Kırmızı', '🟡 Sarı', '🟢 Yeşil', '🟠 Turuncu', '⚪️ Beyaz'],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '618e25b6d19a51578c04c23b',
      template_id: '618e246afb043a4594290afd',
      timeout_duration_in_week: 4,
      order_number: 0,
      name: 'Beklenen Ayakkabı Alma Zamanı',
      text: 'Bir sonraki ayakkabınızı ne zaman almayı düşünüyorsunuz?',
      type: 'demographics',
      subtype: 'single',
      choices: [ 'Bu hafta içinde', '2 hafta içinde', '1 ay içinde', '6 ay içinde', 'Belirsiz' ],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '61fd1c495935453b902920ca',
      template_id: '6188879cea38c6346cbf20ec',
      timeout_duration_in_week: 52,
      order_number: 0,
      name: 'Marka Duyma Şekli',
      text: 'ShoesMagic markasını nasıl duydunuz?',
      type: 'brand',
      subtype: 'single',
      choices: [ 'Sosyal Medya', 'Reklam', 'Tanıdık', 'Alışveriş Sırasında', 'Ürün Araması Sonucu', 'Hatırlamıyorum' ],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    }
  ],
  graphs: [
    {
      _id: '618e2556c619bb9c6abf817f',
      question_type: 'demographics',
      integration_path_id_list: [
        '61fd1748fbdd7a89bc29fc0d'
      ],
      title: 'Cinsiyet',
      description: 'Cinsiyetiniz nedir?',
      type: 'pie_chart',
      data: [
        {
          name: 'Erkek',
          value: 21282
        },
        {
          name: 'Kadın',
          value: 9121
        }
      ],
      created_at: '19.03.2022',
      is_active: true,
      total: 30403
    },
    {
      _id: '618e25b0d19a51578c04c219',
      question_type: 'demographics',
      integration_path_id_list: [
        '61fd1748fbdd7a89bc29fc0d'
      ],
      title: 'Renk Tercihi',
      description: 'Aşağıdaki renklerden hangisini tercih edersiniz?',
      type: 'pie_chart',
      data: [
        {
          name: '🔵 Mavi',
          value: 10288
        },
        {
          name: '🔴 Kırmızı',
          value: 13203
        },
        {
          name: '🟡 Sarı',
          value: 3189
        },
        {
          name: '🟢 Yeşil',
          value: 2733
        },
        {
          name: '🟠 Turuncu',
          value: 1677
        },
        {
          name: '⚪️ Beyaz',
          value: 9452
        }
      ],
      created_at: '20.03.2022',
      is_active: true,
      total: 40542
    },
    {
      _id: '618e25b6d19a51578c04c23b',
      question_type: 'demographics',
      integration_path_id_list: [
        '61fd1748fbdd7a89bc29fc0d'
      ],
      title: 'Beklenen Ayakkabı Alma Zamanı',
      description: 'Bir sonraki ayakkabınızı ne zaman almayı düşünüyorsunuz?',
      type: 'pie_chart',
      data: [
        {
          name: 'Bu hafta içinde',
          value: 8298
        },
        {
          name: '2 hafta içinde',
          value: 5535
        },
        {
          name: '1 ay içinde',
          value: 2577
        },
        {
          name: '6 ay içinde',
          value: 3896
        },
        {
          name: 'Belirsiz',
          value: 3627
        }
      ],
      created_at: '20.03.2022',
      is_active: true,
      total: 23933
    },
    {
      _id: '61fd1c495935453b902920ca',
      question_type: 'demographics',
      integration_path_id_list: [
        '61fd1748fbdd7a89bc29fc0d'
      ],
      title: 'Marka Duyma Şekli',
      description: 'ShoesMagic markasını nasıl duydunuz?',
      type: 'pie_chart',
      data: [
        {
          name: 'Sosyal Medya',
          value: 2677
        },
        {
          name: 'Reklam',
          value: 3447
        },
        {
          name: 'Tanıdık',
          value: 1203
        },
        {
          name: 'Alışveriş Sırasında',
          value: 2057
        },
        {
          name: 'Ürün Araması Sonucu',
          value: 1577
        },
        {
          name: 'Hatırlamıyorum',
          value: 1491
        }
      ],
      created_at: '27.03.2022',
      is_active: false,
      total: 12452
    }
  ],
  templates: [
    {
      _id: '618e2471d19a51578c04c1e3',
      timeout_duration_in_week: 52,
      timeout_duration_in_week_by_choices: null,
      order_number: 0,
      language: 'tr',
      name: 'Yaş',
      text: 'Kaç yaşındasınız?',
      type: 'demographics',
      subtype: 'number',
      choices: [],
      min_value: 1,
      max_value: 100,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '6187767468dee623cf96f64f',
      timeout_duration_in_week: 52,
      timeout_duration_in_week_by_choices: null,
      order_number: 1,
      language: 'tr',
      name: 'Şehir',
      text: 'Hangi şehirde yaşıyorsunuz?',
      type: 'demographics',
      subtype: 'list',
      choices: ['Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'İçel (Mersin)', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '6187769cea38c6346cbf20ec',
      timeout_duration_in_week: 36,
      timeout_duration_in_week_by_choices: null,
      order_number: 2,
      language: 'tr',
      name: 'Aylık Bütçe: Giyim / Ayakkabı',
      text: 'Ayakkabı alışverişine aylık ortalama ne kadar bütçe ayırıyorsunuz?',
      type: 'demographics',
      subtype: 'single',
      choices: ['0-100₺', '100-250₺', '250-500₺', '500-750₺', '750-1000₺', '1000+₺'],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '6187ba2a09ea1f0b9519afa6',
      timeout_duration_in_week: 52,
      timeout_duration_in_week_by_choices: null,
      order_number: 3,
      language: 'tr',
      name: 'Marka Güvenilirliği',
      text: 'ShoesMagic markasını ne kadar güvenilir buluyorsunuz?',
      type: 'brand',
      subtype: 'scale',
      choices: [],
      min_value: 1,
      max_value: 5,
      labels: { left: 'Hiç güvenilir bulmuyorum', middle: null, right: 'Tamamen güvenilir buluyorum' }
    },
    {
      _id: '618e240ffb043a45942809fa',
      timeout_duration_in_week: 52,
      timeout_duration_in_week_by_choices: null,
      order_number: 4,
      language: 'tr',
      name: 'Marka Duyma Zamanı',
      text: 'ShoesMagic markasını ne kadar süredir biliyorsunuz?',
      type: 'brand',
      subtype: 'single',
      choices: ['Yeni duydum', '1-4 hafta', '1-2 ay', '2-6 ay', '6 ay - 2 yıl', '2 yıl üstü'],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '618e245cd19a51578c04c1e0',
      timeout_duration_in_week: 12,
      timeout_duration_in_week_by_choices: null,
      order_number: 5,
      language: 'tr',
      name: 'Koleksiyon Alma Durumu',
      text: 'Aynı koleksiyona ait bir ürünü daha önce aldınız mı?',
      type: 'product',
      subtype: 'yes_no',
      choices: [],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '618e2462c619bb9c6abf8173',
      timeout_duration_in_week: 12,
      timeout_duration_in_week_by_choices: null,
      order_number: 6,
      language: 'tr',
      name: 'Ürün Fiyatı',
      text: 'Ürün fiyatı hakkında ne düşünüyorsunuz?',
      type: 'product',
      subtype: 'single',
      choices: ['Çok Ucuz', 'Ucuz', 'Uygun', 'Normal', 'Biraz pahalı', 'Çok pahalı'],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    },
    {
      _id: '618e246afb043a45942809fd',
      timeout_duration_in_week: 12,
      timeout_duration_in_week_by_choices: null,
      order_number: 7,
      language: 'tr',
      name: 'Ürün Renk Seçenekleri',
      text: 'Bu ürünün renk seçenekleri hakkında ne düşünüyorsunuz?',
      type: 'product',
      subtype: 'single',
      choices: ['Çok fazla seçenek var', 'Yeterli seçenek var', 'Yeterince seçenek yok', 'Çok az seçenek var'],
      min_value: null,
      max_value: null,
      labels: { left: null, middle: null, right: null }
    }
  ]
}

module.exports = (data, callback) => {
  const demo = {};

  if (!data)
    data = {};

  demo.company = data.company ? data.company : defaultDemoData.company;
  demo.products = data.products ? data.products : defaultDemoData.products;
  demo.ads = data.ads ? data.ads : defaultDemoData.ads;
  demo.target_groups = data.target_groups ? data.target_groups : defaultDemoData.target_groups;
  demo.questions = data.questions ? data.questions : defaultDemoData.questions;
  demo.graphs = data.graphs ? data.graphs : defaultDemoData.graphs;
  demo.templates = data.templates ? data.templates : defaultDemoData.templates;

  return callback(demo);
}
