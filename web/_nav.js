import messages from "./views/Util/Messages";

export default {
  items: [
    {
      name: messages.common_dashboard,
      url: '/dashboard',
      icon: 'icon-speedometer',
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
      name: messages.common_user_information,
      url: '/information',
      icon: 'icon-people',
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
      name: messages.common_user_activity,
      url: '/activity',
      icon: 'icon-people',
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
    },
    {
      name: messages.report,
      url: '/report',
      icon: 'icon-note',
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
  ],
};
