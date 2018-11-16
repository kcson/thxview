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
import axios from "axios";
import messages from "../../views/Util/Messages";

class Full extends Component {
  constructor(props) {
    super(props);
    let selectedSite = null;
    let sites = null;
    if (sessionStorage.sites !== undefined) {
      sites = JSON.parse(sessionStorage.sites);
      if (sites !== null) {
        selectedSite = sites[0].tracking_id;
      }
    }
    this.state = {
      sites: sites,
      selectedSite: selectedSite
    };
  }

  selectSite = (tracking_id) => {
    this.setState({selectedSite: tracking_id})
  };

  renderHome() {
    const role = sessionStorage.role;
    if (Number(role) === 1) {
      return <Redirect from="/" to="/user"/>
    } else {
      return <Redirect from="/" to="/dashboard"/>
    }
  }

  render() {
    const {sites, selectedSite} = this.state;
    if (selectedSite == null) {
      axios.defaults.headers.common['X-THX-INDEX'] = 'logstash';
    } else {
      axios.defaults.headers.common['X-THX-INDEX'] = selectedSite;
    }

    let mRoleArray = null;//['M_DASHBOARD','M_INFO','M_ACTIVITY','M_ACCESS_LOG','M_REPORT','M_SETTING'];
    const role = sessionStorage.role;
    const menus = sessionStorage.menus;
    if (menus) {
      mRoleArray = JSON.parse(menus);
    }

    const items = [];
    const items1 = [];
    if (role) {
      navigation.items.map(d => {
        if (d.role) {
          if (d.role.includes(Number(role))) {
            //console.log(d)
            items.push(d);
          }
        }
      });
    }
    console.log(items);
    if (mRoleArray) {
      items.map(d => {
        if (d.m_role) {
          if (mRoleArray.includes(d.m_role[0])) {
            let item = {};
            item.name = d.name;
            item.url = d.url;
            item.icon = d.icon;
            if (d.children) {
              item.children = [];
              d.children.map((child) => {
                if (child.m_role) {
                  if (mRoleArray.includes(child.m_role[0])) {
                    item.children.push(child);
                  }
                }
              })
            }
            //console.log(d)
            items1.push(item);
          }
        }
      });
    }

    let nav = {};
    nav.items = items1;
    console.log(nav);

    if (!sessionStorage.userid) {
      return (
          <Redirect to="/login"/>
      )
    } else {
      return (
          <div className="app">
            <AppHeader fixed>
              <FullHeader history={this.props.history} sites={sites} selectedSite={selectedSite} selectSite={this.selectSite}/>
            </AppHeader>
            <div className="app-body">
              <AppSidebar fixed display="lg">
                <AppSidebarHeader/>
                <AppSidebarForm/>
                <AppSidebarNav navConfig={nav} {...this.props} />
                <AppSidebarFooter/>
                <AppSidebarMinimizer/>
              </AppSidebar>
              <main className="main">
                <Container fluid style={{paddingTop: 30 + 'px'}}>
                  <Switch>
                    {routes.map((route, idx) => {
                          return route.component ? (<Route key={idx} path={route.path} exact={route.exact} name={route.name} render={props => (
                                  <route.component {...props} selectedSite={selectedSite}/>
                              )}/>)
                              : (null);
                        },
                    )}
                    {this.renderHome()}
                  </Switch>
                </Container>
              </main>
              <AppAside fixed hidden>
                <FullAside/>
              </AppAside>
            </div>
          </div>
      );
    }
  }
}

export default Full;
