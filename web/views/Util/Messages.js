import LocalizedStrings from 'react-localization';

let messages = new LocalizedStrings({
  en: {
    common_dashboard: "Dashboard",
    common_user_information: "User Information",
    common_user_activity: "User Activity"
  },
  ko: {
    common_dashboard: "대시보드",
    common_user_information: "사용자 정보",
    common_user_activity: "사용자 행동"
  }
});

export default messages;