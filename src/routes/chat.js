export default {
  name: 'chat',
  path: 'chat',
  component: () => import('@/view/chat'),
  meta: {
    title: '聊天'
  },
  children: [
    {
      name: 'tipoffs',
      path: 'tipoffs',
      component: () => import('@/view/chat/tipoffs')
    },
    {
      name: 'single',
      path: 'single',
      component: () => import('@/view/chat/single'),
      children: [
        {
          name: 'single-message',
          path: 'message',
          component: () => import('@/view/chat/single/message')
        }
      ]
    },
    {
      name: 'discussion',
      path: 'discussion',
      component: () => import('@/view/chat/discussion'),
      children: [
        {
          name: 'discussion-message',
          path: 'message',
          component: () => import('@/view/chat/discussion/message')
        }
      ]
    },
    {
      name: 'group',
      path: 'group',
      component: () => import('@/view/chat/group'),
      children: [
        {
          name: 'groupManage',
          path: 'manage',
          component: () => import('@/view/chat/group/manage')
        },
        {
          name: 'group-message',
          path: 'message',
          component: () => import('@/view/chat/group/message')
        },
        {
          name: 'member',
          path: 'member',
          component: () => import('@/view/chat/group/member')
        },
        {
          name: 'information',
          path: 'information',
          component: () => import('@/view/chat/group/information')
        },
        {
          name: 'setGroupInfo',
          path: 'setGroupInfo',
          component: () => import('@/view/chat/group/information/setInfo')
        },
        {
          name: 'files',
          path: 'files',
          component: () => import('@/view/chat/group/files')
        }
        // {
        //     name: 'testwq',
        //     path: 'testwq',
        //     component: () => import('@/view/chat/group/testwq')
        // }
      ]
    }
  ]
};
