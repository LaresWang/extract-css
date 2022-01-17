export default [
  {
    name: 'login',
    path: '/user/login',
    component: () => import('@/layouts/user/login'),
    meta: {
      title: '登录'
    },
    children: [
      {
        name: 'login-pass',
        path: 'pass',
        component: () => import('@/layouts/user/login/pass')
      },
      {
        name: 'login-email',
        path: 'email',
        component: () => import('@/layouts/user/login/email')
      },
      {
        name: 'login-qrcode',
        path: 'qrcode',
        component: () => import('@/layouts/user/login/qrcode')
      },
      {
        name: 'login-checking',
        path: 'checking',
        component: () => import('@/layouts/user/login/checking')
      },
      {
        name: 'login-leadinkey',
        path: 'leadinkey',
        component: () => import('@/layouts/user/login/leadinkey')
      },
      {
        name: 'login-creatkey',
        path: 'creatkey',
        component: () => import('@/layouts/user/login/creatkey')
      },
      {
        name: 'login-invitecode',
        path: 'invitecode',
        component: () => import('@/layouts/user/login/invitecode')
      },
      {
        name: 'login-syncdata',
        path: 'syncdata',
        component: () => import('@/layouts/user/login/syncdata')
      },
      {
        name: 'resister',
        path: '/user/ordinaryRegister',
        component: () => import('@/layouts/user/register/ordinaryRegister'),
        meta: {
          title: '普通用户注册'
        }
      }
    ]
  },
  {
    name: 'forget',
    path: '/user/forget',
    component: () => import('@/layouts/user/forget'),
    meta: {
      title: '忘记密码'
    },
    children: [
      {
        name: 'forget-phone',
        path: 'phone',
        component: () => import('@/layouts/user/forget/phone')
      },
      {
        name: 'forget-email',
        path: 'email',
        component: () => import('@/layouts/user/forget/email')
      },
      {
        name: 'forget-newpass',
        path: 'newpass',
        component: () => import('@/layouts/user/forget/newpass')
      }
    ]
  },
  {
    name: 'register',
    path: '/user/register',
    component: () => import('@/layouts/user/register'),
    meta: {
      title: '专业用户注册'
    }
  },
  {
    name: 'media',
    path: '/user/media',
    component: () => import('@/components/chat/media'),
    meta: {
      title: 'media'
    }
  },
  {
    name: 'audio',
    path: '/user/audio',
    component: () => import('@/components/chat/audio'),
    meta: {
      title: 'audio'
    }
  },
  {
    name: 'tray',
    path: '/user/tray',
    component: () => import('@/layouts/WinTray'),
    meta: {
      title: 'tray'
    }
  },
];
