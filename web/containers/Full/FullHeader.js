import React, {Component} from 'react';
import {ButtonDropdown, ButtonGroup, DropdownItem, DropdownMenu, DropdownToggle, Nav} from 'reactstrap';
import PropTypes from 'prop-types';

import {AppBreadcrumb, AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import axios from 'axios';
import routes from "../../routes";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class FullHeader extends Component {
  constructor(props) {
    super(props);
    this.state ={
      siteToggle : false
    }
  }

  handleLogout = () => {
    console.log('click logout');
    axios('/logout').then(
        (response) => {
          console.log(response)
          this.props.history.push('/login');
        },
        (err) => {
          console.log(err);
        }
    );
  };

  render() {
    // eslint-disable-next-line
    const {siteToggle} = this.state;

    return (
        <React.Fragment>
          <AppSidebarToggler className="d-lg-none" display="md" mobile/>
          <AppNavbarBrand
              full={{src: '/public/img/brand/thxview.jpg', width: 200, height: 56, alt: 'CoreUI Logo'}}
              minimized={{src: '/public/img/brand/thxview_m.jpg', width: 50, height: 56, alt: 'CoreUI Logo'}}
          />
          <AppSidebarToggler className="d-md-down-none" display="lg"/>
          <AppBreadcrumb style={{margin: 0, border: 0}} appRoutes={routes}/>
          <Nav className="ml-auto" navbar>
            <ButtonGroup className="float-right" style={{marginRight: 20 + 'px'}}>
              <ButtonDropdown id='siteToggle' isOpen={siteToggle} toggle={() => {
                this.setState({siteToggle: !siteToggle});
              }}>
                <DropdownToggle className='btn-outline-dark' caret style={{paddingTop: 4 + 'px'}} >
                  pla-skin.com
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={this.onDropDownClick} value='pla-skin.com'>pla-skin.com</DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </ButtonGroup>
            <AppHeaderDropdown style={{marginRight: 10 + 'px'}} direction="down">
              <DropdownToggle nav>
                <span>{sessionStorage.userid}({sessionStorage.username})</span>
                <img src={'/public/img/avatars/3.jpg'} className="img-avatar" alt="admin@bootstrapmaster.com"/>
              </DropdownToggle>
              <DropdownMenu right style={{right: 'auto'}}>
                {/*<DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
              <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem>
              <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem>*/}
                <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
                {/*<DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
              <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem>
              <DropdownItem divider />
              <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem>*/}
                <DropdownItem onClick={this.handleLogout}><i className="fa fa-lock"></i>Logout</DropdownItem>
              </DropdownMenu>
            </AppHeaderDropdown>
          </Nav>
          {/*<AppAsideToggler className="d-md-down-none"/>*/}
          {/*<AppAsideToggler className="d-lg-none" mobile />*/}
        </React.Fragment>
    );
  }
}

FullHeader.propTypes = propTypes;
FullHeader.defaultProps = defaultProps;

export default FullHeader;
