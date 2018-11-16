import messages from "./views/Util/Messages";

export default {
  items: [
    {
      name: messages.dashboard,
      url: '/dashboard',
      icon: 'icon-speedometer',
      role: [2],
      m_role: ['M_DASHBOARD'],
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
      m_role: ['M_INFO'],
      //variant: 'success',
      children: [
        {
          name: 'Overview',
          url: '/information/summary',
          icon: 'icon-magnifier',
          m_role: ['M_INFO_OVERVIEW'],
        },
        {
          name: 'Traffic Sources',
          url: '/information/traffic_source',
          icon: 'icon-doc',
          m_role: ['M_INFO_TS'],
        },
        {
          name: 'OS',
          url: '/information/os',
          icon: 'icon-wrench',
          m_role: ['M_INFO_OS'],
        },
        {
          name: 'Browser',
          url: '/information/browser',
          icon: 'icon-globe',
          m_role: ['M_INFO_BROWSER'],
        },
        {
          name: 'User Locations',
          url: '/information/location',
          icon: 'icon-location-pin',
          m_role: ['M_INFO_LOCATION'],
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
      m_role: ['M_ACTIVITY'],
      children: [
        {
          name: 'Overview',
          url: '/activity/summary',
          icon: 'icon-magnifier',
          m_role: ['M_ACTIVITY_OVERVIEW'],
        },
        {
          name: 'Page Views',
          url: '/activity/pageview',
          icon: 'icon-book-open',
          m_role: ['M_ACTIVITY_PAGE_VIEW'],
        },
        {
          name: 'Activity Flow',
          url: '/activity/flow',
          icon: 'icon-compass',
          m_role: ['M_ACTIVITY_ACTIVITY_FLOW'],
        },
        {
          name: 'Conversions',
          url: '/activity/conversion',
          icon: 'icon-loop',
          m_role: ['M_ACTIVITY_CONVERSION'],
        },
        {
          name: 'Purchases',
          url: '/activity/purchase',
          icon: 'icon-bag',
          m_role: ['M_ACTIVITY_PURCHASE'],
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
      m_role: ['M_ACCESS_LOG'],
    },
    {
      name: messages.report,
      url: '/report',
      icon: 'icon-note',
      role: [2],
      m_role: ['M_REPORT'],
      children: [
        {
          name: 'Custom Report',
          url: '/report/generate',
          icon: 'icon-user',
          m_role: ['M_REPORT_CUSTOM_REPORT'],
        },
        {
          name: 'Management',
          url: '/report/mgmt',
          icon: 'icon-magnifier',
          m_role: ['M_REPORT_MANAGEMENT'],
        }
      ],
    },
    {
      name: messages.settings,
      url: '/settings',
      icon: 'icon-settings',
      role: [2],
      m_role: ['M_SETTING'],
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
          m_role: ['M_SETTING_MANAGE_PAGE'],
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
      m_role: ['M_MANAGE_SETTING'],
      children: [
        {
            name: messages.settings_manage_site,
            url: '/settings/conversion',
            icon: 'icon-magnifier',
            m_role: ['M_MANAGE_SETTING_SITE'],
        },
        {
            name: messages.settings_manage_admin,
            url: '/settings/page',
            icon: 'icon-book-open',
            m_role: ['M_MANAGE_SETTING_ADMIN'],
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
        m_role: ['M_MANAGE_USER'],
    },
  ],
};
