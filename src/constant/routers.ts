export const RoutersInfo = {
  empty: {
    path: '/',
    name: 'empty'
  },

  defaulttimelines: {
    path: '/timelines/:timeLineType',
    name: 'defaulttimelines'
  },

  tagtimelines: {
    path: '/timelines/tag/:tagName',
    name: 'tagtimelines'
  },

  listtimelines: {
    path: '/timelines/list/:listName',
    name: 'listtimelines'
  },

  home: {
    path: '/home',
    name: 'home'
  },
};
