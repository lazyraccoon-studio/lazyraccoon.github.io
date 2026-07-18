/* ============================================================
   data.js — structured content (projects, services, values,
   process steps). Bilingual fields use {ko, en}.
   Edit freely; app.js renders whatever is here.
   Blog posts are NOT here — they live as Markdown in /posts
   (see posts/posts.json).
   ============================================================ */

/* Services / capabilities (also used for the "what we build" grid) */
window.SERVICES = [
  {
    id: { ko: '01 / 게임', en: '01 / Games' },
    title: 'Game Development',
    d: {
      ko: '기획·프로토타입·출시까지. 유니티와 웹 기반의 작지만 오래 남는 게임을 만듭니다.',
      en: 'From concept to prototype to launch. Small but lasting games on Unity and the web.'
    },
    items: {
      ko: ['게임 기획 & 프로토타이핑', '실시간 멀티플레이 서버', '출시 & 라이브 운영'],
      en: ['Game design & prototyping', 'Realtime multiplayer servers', 'Launch & live-ops']
    }
  },
  {
    id: { ko: '02 / 앱·서비스', en: '02 / Apps & Services' },
    title: 'Apps & Services',
    d: {
      ko: '웹·모바일 제품을 설계하고 운영합니다. 정적 사이트부터 실시간 서비스까지.',
      en: 'We design and run web & mobile products — from static sites to realtime services.'
    },
    items: {
      ko: ['웹 · 모바일 앱 개발', '백엔드 & API 설계', '정적 사이트 & 배포 자동화'],
      en: ['Web & mobile app dev', 'Backend & API design', 'Static sites & deploy automation']
    }
  },
  {
    id: { ko: '03 / 외주·콜라보', en: '03 / Contract & Collab' },
    title: 'Studio for Hire',
    d: {
      ko: '개발 파트너가 필요할 때. 팀에 합류하거나 처음부터 함께 만듭니다.',
      en: 'When you need a dev partner. We join your team or build with you from scratch.'
    },
    items: {
      ko: ['외주 개발 & 컨설팅', 'MVP 빠른 구축', '기술 파트너십'],
      en: ['Contract dev & consulting', 'Fast MVP builds', 'Technical partnership']
    }
  }
];

/* Selected work — now loaded from Markdown: see projects/projects.json
   and projects/<slug>.ko.md / <slug>.en.md */

/* How we work — values */
window.VALUES = [
  { h: { ko: '느긋하게, 제대로', en: 'Slow, but right' }, d: { ko: '빠르게보다 오래 가는 것을. 서두르지 않고 끝까지.', en: 'Longevity over speed. No rushing, all the way through.' } },
  { h: { ko: '작게, 깊게', en: 'Small, deep' }, d: { ko: '작은 팀이라 더 깊이 판다. 사용자와 코드 모두.', en: 'A small team digs deeper — into both users and code.' } },
  { h: { ko: '밤에 더 잘', en: 'Better after dark' }, d: { ko: '조용한 시간에 집중해서 만든다. 야행성 빌더.', en: 'We focus in the quiet hours. Nocturnal builders.' } },
  { h: { ko: '열어두기', en: 'Open by default' }, d: { ko: '만드는 과정을 개발일지로 공유한다.', en: 'We share how we build through dev logs.' } }
];

/* Process steps */
window.STEPS = [
  { n: '01', h: { ko: '대화', en: 'Talk' }, d: { ko: '무엇을, 왜 만드는지부터 시작합니다.', en: 'Start with what and why.' } },
  { n: '02', h: { ko: '설계', en: 'Design' }, d: { ko: '작게 쪼개고 프로토타입으로 확인합니다.', en: 'Break it small, validate with prototypes.' } },
  { n: '03', h: { ko: '개발', en: 'Build' }, d: { ko: '짧은 주기로 만들고 자주 공유합니다.', en: 'Ship in short cycles, share often.' } },
  { n: '04', h: { ko: '운영', en: 'Run' }, d: { ko: '출시 후에도 함께 갑니다.', en: 'We stay after launch.' } }
];

