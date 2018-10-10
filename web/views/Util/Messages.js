import LocalizedStrings from 'react-localization';

let messages = new LocalizedStrings({
  en: {
    dashboard: "Dashboard",
    user_information: "User Information",
    user_activity: "User Activity",

    access_log: "Access Log",

    report: "Report",

    settings: "Settings",
    settings_manage_site: "Manage Sites",
    settings_manage_admin: "Manage Administrator",
    settings_manage_user: "Manage User"
  },
  ko: {
    dashboard: "대시보드",
    user_information: "사용자 특성 분석",
    user_activity: "사용자 행동 분석",

    access_log: "접근 로그",

    report: "보고서",

    settings: "설정",
    settings_manage_site: "사이트 관리",
    settings_manage_admin: "관리자 관리",
    settings_manage_user: "계정 관리"
  }
});

export default messages;