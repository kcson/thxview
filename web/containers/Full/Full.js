import React, {Component} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'reactstrap';

import {
  AppAside,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import FullAside from './FullAside';
import FullHeader from './FullHeader';

class Full extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.location);
    return (
        <div className="app">
          <AppHeader fixed>
            <FullHeader history={this.props.history}/>
          </AppHeader>
          <div className="app-body">
            <AppSidebar fixed display="lg">
              <AppSidebarHeader/>
              <AppSidebarForm/>
              <AppSidebarNav navConfig={navigation} {...this.props} />
              <AppSidebarFooter/>
              <AppSidebarMinimizer/>
            </AppSidebar>
            <main className="main">
              {/*<AppBreadcrumb appRoutes={routes}/>*/}
              <Container fluid style={{paddingTop: 30 + 'px'}}>
                <Switch>
                  {routes.map((route, idx) => {
                        return route.component ? (<Route key={idx} path={route.path} exact={route.exact} name={route.name} render={props => (
                                <route.component {...props} />
                            )}/>)
                            : (null);
                      },
                  )}
                  <Redirect from="/" to="/dashboard"/>
                </Switch>
              </Container>
            </main>
            <AppAside fixed hidden>
              <FullAside/>
            </AppAside>
          </div>
          {/*<AppFooter style={{height: 30 + 'px'}}>
          <FullFooter/>
        </AppFooter>*/}
        </div>
    );
  }
}

export default Full;
