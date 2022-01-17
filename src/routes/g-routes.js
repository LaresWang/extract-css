export default [
  {
    name: 'setting',
    path: 'setting',
    component: () => import('@/view/setting/Index'),
    redirect: '/app/setting/general',
    meta: {
      title: '个人设置'
    },
    children: [
      {
        name: 'secretKey-setting',
        path: 'secretKey',
        component: () => import('@/view/setting/form/secretKey')
      },
      {
        name: 'general-setting',
        path: 'general',
        component: () => import('@/view/setting/GeneralSetting')
      },
      {
        name: 'identity-setting',
        path: 'identity',
        component: () => import('@/view/setting/IdentitySetting'),
        redirect: '/app/setting/identity/phone',
        children: [
          {
            name: 'identity-setting-phone',
            path: 'phone',
            component: () => import('@/view/setting/form/IdentitySettingPhoneFrom')
          },
          {
            name: 'identity-setting-email',
            path: 'email',
            component: () => import('@/view/setting/form/IdentitySettingEmailFrom')
          },
          {
            name: 'identity-setting-google',
            path: 'google',
            component: () => import('@/view/setting/form/IdentitySettingGoogleFrom')
          }
        ]
      },
      {
        name: 'safe-setting',
        path: 'safe',
        component: () => import('@/view/setting/SafeSetting'),
        redirect: '/app/setting/safe/email',
        children: [
          {
            name: 'safe-setting-email',
            path: 'email',
            component: () => import('@/view/setting/form/SafeSettingEmailFrom')
          },
          {
            name: 'safe-setting-phone',
            path: 'phone',
            component: () => import('@/view/setting/form/SafeSettingPhoneFrom')
          }
        ]
      }
    ]
  },
  {
    name: 'upgrade-account',
    path: 'upgradeAccount',
    component: () => import('@/view/setting/upgradeAccount')
  },
  {
    name: 'test',
    path: 'test',
    component: () => import('@/view/test'),
    meta: {
      title: 'test'
    }
  },
  {
    name: 'funds',
    path: 'funds',
    component: () => import('@/view/funds/Index'),
    meta: {
      title: '资金'
    },
    redirect: '/app/funds/general',
    children: [
      {
        name: 'general-funds',
        path: 'general',
        component: () => import('@/view/funds/fund-general/Index'),
        redirect: '/app/funds/general/wallet',
        children: [
          {
            name: 'tradepwd-funds-wallet',
            path: 'wallet',
            component: () => import('@/view/funds/fund-general/table/fundWallet'),
            props: {
              type: 'wallet'
            }
          },
          {
            name: 'tradepwd-funds-mining',
            path: 'mining',
            component: () => import('@/view/funds/fund-general/table/fundMining'),
            props: {
              type: 'mining'
            }
          },
          {
            name: 'tradepwd-funds-ore',
            path: 'ore',
            component: () => import('@/view/funds/fund-general/table/fundOre')
          }
        ]
      },
      {
        name: 'tradepwd-funds',
        path: 'tradepwd',
        component: () => import('@/view/funds/tradepsd/Index'),
        redirect: '/app/funds/tradepwd/email',
        children: [
          {
            name: 'tradepwd-email-tab',
            path: 'email',
            component: () => import('@/view/funds/tradepsd/from/EmailForm')
          },
          {
            name: 'tradepwd-phone-tab',
            path: 'phone',
            component: () => import('@/view/funds/tradepsd/from/PhoneForm')
          },
          {
            name: 'tradepwd-google-tab',
            path: 'google',
            component: () => import('@/view/funds/tradepsd/from/GoogleForm')
          }
        ]
      },
      {
        name: 'detail-funds',
        path: 'detail',
        component: () => import('@/view/funds/miningDetail/index')
      },
      {
        name: 'address-funds',
        path: 'address',
        component: () => import('@/view/funds/withdrawal-address/Index')
      }
    ]
  },
  {
    name: 'contact',
    path: 'contact',
    component: () => import('@/view/contact'),
    meta: {
      title: '联系人'
    },
    children: [
      {
        name: 'contact-info',
        path: 'info',
        component: () => import('@/view/contact/info')
      },
      {
        name: 'relation',
        path: 'relation',
        component: () => import('@/view/contact/relation')
      },
      {
        name: 'contact-group',
        path: 'group',
        component: () => import('@/view/contact/group')
      },
      {
        name: 'new-friends',
        path: 'addfriends',
        component: () => import('@/view/contact/newfriends')
      }
    ]
  }
];
