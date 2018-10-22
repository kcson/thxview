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
    this.state = {
      siteToggle: false,
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

  handleDropDownClick = (e) => {
    const {selectedSite} = this.props;
    if (selectedSite !== e.target.value) {
      this.props.selectSite(e.target.value);
    }
  };

  renderDropDown() {
    const {siteToggle} = this.state;
    const {sites, selectedSite} = this.props;
    let selectedUrl = null;
    let dropDown = [];
    if (sites == null) {
      return null;
    } else {
      sites.map((site, index) => {
            dropDown.push(<DropdownItem key={index} onClick={this.handleDropDownClick} value={site.tracking_id}>{site.url}</DropdownItem>)
            if (site.tracking_id === selectedSite) {
              selectedUrl = site.url;
            }
          }
      );
      return (
          <ButtonDropdown id='siteToggle' isOpen={siteToggle} toggle={() => {
            this.setState({siteToggle: !siteToggle});
          }}>
            <DropdownToggle className='btn-outline-dark' caret style={{paddingTop: 4 + 'px'}}>
              {selectedUrl}
            </DropdownToggle>
            <DropdownMenu right>
              {dropDown}
            </DropdownMenu>
          </ButtonDropdown>
      )
    }
  }

  render() {
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
              {this.renderDropDown()}
            </ButtonGroup>
            <AppHeaderDropdown style={{marginRight: 10 + 'px'}} direction="down">
              <DropdownToggle nav>
                <span>{sessionStorage.userid}({sessionStorage.username})</span> <img src={'/public/img/avatars/3.jpg'} className="img-avatar" alt="admin@bootstrapmaster.com"/>
              </DropdownToggle>
              <DropdownMenu right style={{right: 'auto'}}>
                <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
                <DropdownItem onClick={this.handleLogout}><i className="fa fa-lock"></i>Logout</DropdownItem>
              </DropdownMenu>
            </AppHeaderDropdown>
          </Nav>
        </React.Fragment>
    );
  }
}

FullHeader.propTypes = propTypes;
FullHeader.defaultProps = defaultProps;

export default FullHeader;
