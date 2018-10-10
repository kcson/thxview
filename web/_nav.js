import messages from "./views/Util/Messages";

export default {
  items: [
    {
      name: messages.dashboard,
      url: '/dashboard',
      icon: 'icon-speedometer',
      role: [2],
      badge: {
        variant: 'info',
        //text: 'NEW',
      },
    },
    {
      divider: true,
    },
    {
      //title: true,
      name: messages.user_information,
      url: '/information',
      icon: 'icon-people',
      role: [2],
      //variant: 'success',
      children: [
        {
          name: 'Overview',
          url: '/information/summary',
          icon: 'icon-magnifier',
        },
        {
          name: 'Traffic Sources',
          url: '/information/traffic_source',
          icon: 'icon-doc',
        },
        {
          name: 'OS',
          url: '/information/os',
          icon: 'icon-wrench',
        },
        {
          name: 'Browser',
          url: '/information/browser',
          icon: 'icon-globe',
        },
        {
          name: 'User Locations',
          url: '/information/location',
          icon: 'icon-location-pin',
        },
      ],
    },
    {
      divider: true,
    },
    {
      name: messages.user_activity,
      url: '/activity',
      icon: 'icon-people',
      role: [2],
      children: [
        {
          name: 'Overview',
          url: '/activity/summary',
          icon: 'icon-magnifier',
        },
        {
          name: 'Page Views',
          url: '/activity/pageview',
          icon: 'icon-book-open',
        },
        {
          name: 'Activity Flow',
          url: '/activity/flow',
          icon: 'icon-compass',
        },
        {
          name: 'Conversions',
          url: '/activity/conversion',
          icon: 'icon-loop',
        },
        {
          name: 'Purchases',
          url: '/activity/purchase',
          icon: 'icon-bag',
        },
      ],
    },
    {
      name: messages.access_log,
      url: '/log',
      icon: 'icon-layers',
      badge: {
        variant: 'info',
        //text: 'NEW',
      },
      role: [2],
    },
    {
      name: messages.report,
      url: '/report',
      icon: 'icon-note',
      role: [2],
      children: [
        {
          name: 'Custom Report',
          url: '/report/generate',
          icon: 'icon-user',
        },
        {
          name: 'Management',
          url: '/report/mgmt',
          icon: 'icon-magnifier',
        }
      ],
    },
    {
      name: messages.settings,
      url: '/settings',
      icon: 'icon-settings',
      role: [2],
      children: [
        // {
        //   name: '전환 페이지 관리',
        //   url: '/settings/conversion',
        //   icon: 'icon-magnifier',
        // },
        {
          name: 'Manage Page',
          url: '/settings/page',
          icon: 'icon-book-open',
        },
        // {
        //   name: '대시보드 관리',
        //   url: '/settings/dashboard',
        //   icon: 'icon-user',
        // },
      ],
    },
    {
      name: messages.settings,
      url: '/settings',
      icon: 'icon-settings',
      role: [1],
      children: [
        {
            name: messages.settings_manage_site,
            url: '/settings/conversion',
            icon: 'icon-magnifier',
        },
        {
            name: messages.settings_manage_admin,
            url: '/settings/page',
            icon: 'icon-book-open',
        },
        // {
        //   name: '대시보드 관리',
        //   url: '/settings/dashboard',
        //   icon: 'icon-user',
        // },
      ],
    },
    {
        name: messages.settings_manage_user,
        url: '/user',
        icon: 'icon-settings',
        badge: {
            variant: 'info',
            //text: 'NEW',
        },
        role: [1],
    },
  ],
};
