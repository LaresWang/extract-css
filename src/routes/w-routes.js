export default [
  /*wq start */
  {
    name: 'guide',
    path: 'guide',
    component: () => import('@/view/guide'),
    meta: {
      title: '导览'
    }
  },
  // {
  //     name: 'chatSetting',
  //     path: 'chatsetting',
  //     component: () => import('@/view/chatSetting'),
  //     meta: {
  //         title: '群聊设置'
  //     }
  // },
  {
    name: 'publish',
    path: 'publish',
    component: () => import('@/view/viewPoint/publish/Index'),
    meta: {
      title: '发布看点'
    }
  },
  {
    name: 'viewPoint',
    path: 'viewpoint',
    component: () => import('@/view/viewPoint'),
    meta: {
      title: '看点'
    }
  },
  {
    name: 'otherPoint',
    path: 'otherpoint',
    component: () => import('@/view/viewPoint/other.vue'),
    meta: {
      title: '用户主页'
    }
  },
  {
    name: 'viewDetail',
    path: 'viewdetail',
    component: () => import('@/view/viewPoint/detail'),
    meta: {
      title: '看点详情'
    }
  },
  {
    name: 'articleDetail',
    path: 'articleDetail',
    component: () => import('@/view/viewPoint/articleDetail'),
    meta: {
      title: '看点详情'
    }
  }
  /*wq end */
];
