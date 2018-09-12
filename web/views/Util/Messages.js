import LocalizedStrings from 'react-localization';

let messages = new LocalizedStrings({
  en: {
    common_dashboard: "Dashboard",
    common_user_information: "User Information",
    common_user_activity: "User Activity",
    access_log: "Access Log",
    report: "Report",
    settings: "Settings"
  },
  ko: {
    common_dashboard: "대시보드",
    common_user_information: "사용자 특성 분석",
    common_user_activity: "사용자 행동 분석",
    access_log: "접근 로그",
    report: "보고서",
    settings: "설정"
  }
});

export default messages;