import {Dashboard,} from './views';
import Full from './containers/Full';
import EmailFilter from './views/Email/EmailFilter';
import EmailMaritime from './views/Email/EmailMaritime';
import EmailGeneral from './views/Email/EmailGeneral'
import InformationSummary from "./views/Information/InformationSummary";
import TrafficSource from "./views/Information/TrafficSource";
import Log from "./views/Log/Log";
import Os from "./views/Information/Os";
import Browser from "./views/Information/Browser";
import Location from "./views/Information/Location";
import ActivitySummary from "./views/Activity/ActivitySummary";
import PageView from "./views/Activity/PageView";
import ActivityFlow from "./views/Activity/ActivityFlow";
import Conversion from "./views/Activity/Conversion";
import Purchase from "./views/Activity/Purchase";
import SettingsPage from "./views/Settings/SettingsPage";
import ReportGenerate from "./views/Report/ReportGenerate";
import ReportMgmt from "./views/Report/ReportMgmt";
import messages from "./views/Util/Messages";
import User from "./views/user/User";


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  {path: '/', exact: true, name: 'Home', component: Full},
  {path: '/dashboard', name: messages.dashboard, component: Dashboard},

  {path: '/information', exact: true, name: messages.user_information, component: InformationSummary},
  {path: '/information/summary', name: 'Overview', component: InformationSummary},
  {path: '/information/traffic_source', name: 'Traffic Source', component: TrafficSource},
  {path: '/information/os', name: 'OS', component: Os},
  {path: '/information/browser', name: 'Browser', component: Browser},
  {path: '/information/location', name: 'User Locations', component: Location},


  {path: '/activity', exact: true, name: messages.user_activity, component: ActivitySummary},
  {path: '/activity/summary', name: 'Overview', component: ActivitySummary},
  {path: '/activity/pageview', name: 'Page views', component: PageView},
  {path: '/activity/flow', name: 'Activity Flow', component: ActivityFlow},
  {path: '/activity/conversion', name: 'Conversions', component: Conversion},
  {path: '/activity/purchase', name: 'Purchases', component: Purchase},

  {path: '/log', exact: true, name: messages.access_log, component: Log},

  {path: '/report', exact: true, name: messages.report, component: ReportMgmt},
  {path: '/report/generate', name: 'Custom Report', component: ReportGenerate},
  {path: '/report/mgmt', exact: true, name: 'Management', component: ReportMgmt},


  {path: '/settings', exact: true, name: messages.settings, component: SettingsPage},
  //{path: '/settings/conversion', exact: true, name: '전환 페이지 관리', component: SettingsConversion},
  {path: '/settings/page', name: 'Manage Page', component: SettingsPage},
  //{path: '/settings/user', name: 'Manage User', component: SettingsPage},
  //{path: '/settings/dashboard', name: '대시보드 관리', component: EmailMaritime}

  {path: '/user', name: 'Manage User', component: User},
  {path: '/user/save', name: 'User Add Save', component: User},
  {path: '/user/delete', name: 'User Delete', component: User},
  {path: '/user/update', name: 'User Update', component: User},
];

export default routes;
