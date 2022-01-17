export default [
  {
    name: 'search',
    path: 'search',
    component: () => import('@/view/guide/search'),
    meta: {
      title: 'search'
    }
  },
  {
    name: 'miningDetail',
    path: 'miningDetail',
    component: () => import('@/view/funds/fund-general/detail/miningDetail'),
    meta: {
      title: '矿区明细'
    }
  },
  {
    name: 'oreDetail',
    path: 'oreDetail',
    component: () => import('@/view/funds/fund-general/detail/oreDetail'),
    meta: {
      title: '挖矿明细'
    }
  },
  {
    name: 'walletDetail',
    path: 'walletDetail',
    component: () => import('@/view/funds/fund-general/detail/walletDetail'),
    meta: {
      title: '钱包明细'
    }
  },
  {
    name: 'fundDetail',
    path: 'fundDetail',
    component: () => import('@/view/funds/fund-general/fundDetail'),
    meta: {
      title: '资产详情'
    }
  },
  {
    name: 'charging',
    path: 'charging',
    component: () => import('@/view/funds/fund-general/fundDetail/handle/charging'),
    meta: {
      title: '充币'
    }
  },
  {
    name: 'transfer',
    path: 'transfer',
    component: () => import('@/view/funds/fund-general/fundDetail/handle/transfer'),
    meta: {
      title: '划转'
    }
  },
  {
    name: 'withdraw',
    path: 'withdraw',
    component: () => import('@/view/funds/fund-general/fundDetail/handle/withdraw'),
    meta: {
      title: '提币'
    }
  },
  {
    name: 'comment',
    path: 'comment',
    component: () => import('@/view/viewPoint/relatedme/comment'),
    meta: {
      title: '评论我的'
    }
  },
  {
    name: 'thumbsup',
    path: 'thumbsup',
    component: () => import('@/view/viewPoint/relatedme/thumbsup'),
    meta: {
      title: '点赞我的'
    }
  },
  {
    name: 'share',
    path: 'share',
    component: () => import('@/view/viewPoint/relatedme/share'),
    meta: {
      title: '分享我的'
    }
  }
];
