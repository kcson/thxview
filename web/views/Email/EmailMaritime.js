import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Pagination,
  PaginationItem,
  PaginationLink,
  Popover,
  PopoverBody,
  PopoverHeader,
  Row,
  TabContent,
  Table,
  TabPane
} from 'reactstrap';
import classnames from 'classnames';
import moment from 'moment';
import 'moment-timezone';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";

class PopoverItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <span>
        <Popover style={{width: 230 + 'px',height: 270 + 'px'}} placement='left' isOpen={this.props.id === this.props.toggleIndex} target={'tonnage-' + this.props.id} toggle={() => {
          this.props.toggle('-1')
        }}>
          <PopoverHeader>
            <div>Phone : 82-2-300-3000</div>
            <div>Mobile : 82-10-3000-4000</div>
            <div>Skype : Broker.Kim</div>
            <div>Email : bk@mail.com</div>
          </PopoverHeader>
          <PopoverBody>
            <FormGroup row>
                <Col xs="12" md="12">
                  <Input type="textarea" name="textarea-input" rows='5' id="textarea-input" placeholder="Content..."/>
                </Col>
            </FormGroup>
            <FormGroup>
              <Button color="primary" size='sm' style={{float: 'right'}}><i className="fa fa-envelope-o"></i> Send mail</Button>
            </FormGroup>
          </PopoverBody>
        </Popover>
      </span>
    );
  }
}

export default class EmailMaritime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      activeTab: '1',
      collapse: [false, false, false, false, false, false, false, false, false, false],
      rows: [],
      activePage: 1,
      totalPage: 0,
      activeBlock: 1,
      totalBlock: 0,
      //received: moment(new Date()).format('YYYY-MM-DD')
      received: '2018-05-18',
      toggledPopover: '-1'
    }
  }

  PAGE_PER_BLOCK = 5;
  ROW_PER_PAGE = 10;

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    let fromDate = this.state.received + '||/d';
    let toDate = this.state.received + '||/d';
    console.log(fromDate + ' : ' + toDate + ' : ' + this.state.activePage)
    // if (this.state.selected === '1') {
    //   fromDate = fromDate + '||-1M/d';
    // } else if (this.state.selected === '2') {
    //   fromDate = fromDate + '||-3M/d';
    // } else if (this.state.selected === '3') {
    //   fromDate = fromDate + '||-6M/d';
    // } else if (this.state.selected === '4') {
    //   fromDate = fromDate + '||-12M/d';
    // } else {
    //   fromDate = fromDate + '||/d';
    // }

    axios({
      method: 'post',
      url: '/email/maritime',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        from: (this.state.activePage - 1) * 10,
        maritime: this.state.activeTab
      }
    }).then(
        (response) => {
          //console.log(response);
          let totalPage = 0;
          if (response.data.hits.total > 0) {
            totalPage = Math.ceil(response.data.hits.total / this.ROW_PER_PAGE);
          }
          this.setState({totalPage});
          this.setState({totalBlock: Math.ceil(totalPage / this.PAGE_PER_BLOCK)});

          const results = [];
          response.data.hits.hits.map((row) => {
            const logDate = moment.tz(row._source['@timestamp'], moment.tz.guess());
            results.push([
              {
                from: row._source.from,
                subject: row._source.subject,
                received: logDate.format('YYYY-MM-DD HH:mm'),
                email: row._source.email
              },
              {
                message: row._source.message
              }
            ])

          });
          this.setState({rows: results})
        },
        (err) => {
          console.log(err)
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  }

  togglePopover = (index) => {
    this.setState({toggledPopover: index});
  };

  popupModel = () => {
    this.setState({modal: !this.state.modal});
  };

  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
        collapse: [false, false, false, false, false, false, false, false, false, false],
        rows: [],
        activePage: 1,
        totalPage: 0,
        activeBlock: 1,
        totalBlock: 0,
        received: '2018-05-18'
      }, this.fetchData);
    }
  };

  expandContent = (index) => {
    this.state.collapse[index] = !this.state.collapse[index];
    this.setState({collapse: this.state.collapse});
  };

  renderTonnage() {
    if (this.state.activeTab !== '1') {
      return
    }

    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

    return this.state.rows.map((row, index) => {
      return row.map((r) => {
        if (r.message || r.message === "") {
          return (
              <tr style={{height: 0}}>
                <td colSpan='10' style={{padding: 0, border: 0}}>
                  <Collapse isOpen={this.state.collapse[index]}>
                    <Card>
                      <CardHeader>
                        <i className="fa fa-align-justify"></i> Mail Content
                      </CardHeader>
                      <CardBody style={{padding: 0, height: 500 + 'px'}}>
                        <Input style={{height: 500 + 'px'}} value={r.message} type="textarea" name="textarea-input" id="textarea-input" rows="9"/>
                      </CardBody>
                    </Card>
                  </Collapse>
                </td>
              </tr>
          )
        } else {
          return (
              <tr>
                <td style={tdStyle} title='Tonnage Filter'>Tonnage Filter</td>
                <td style={tdStyle} title={r.email.vessel_name ? r.email.vessel_name : '-'}>{r.email.vessel_name ? r.email.vessel_name : '-'}</td>
                {/*<td style={tdStyle} title={r.email.spec ? r.email.spec : '-'}>{r.email.spec ? r.email.spec : '-'}</td>*/}
                <td style={tdStyle} title={r.email.dwt ? r.email.dwt : '-'}>{r.email.dwt ? r.email.dwt : '-'}</td>
                <td style={tdStyle} title={r.email.blt ? r.email.blt : '-'}>{r.email.blt ? r.email.blt : '-'}</td>
                <td style={tdStyle} title={r.email.open_area ? r.email.open_area : '-'}>{r.email.open_area ? r.email.open_area : '-'}</td>
                <td style={tdStyle} title={r.email.open_date ? r.email.open_date : '-'}>{r.email.open_date ? r.email.open_date : '-'}</td>
                <td style={tdStyle} title={r.from}>{r.from}</td>
                <td style={tdStyle} title={r.received}>{r.received}</td>
                <td>
                  <Button id={'tonnage-' + index} onClick={() => {
                    this.togglePopover(index)
                  }} style={{padding: 0}} color="link"><i className="fa fa-search fa-lg"></i></Button>
                  <PopoverItem key={index} id={index} toggleIndex={this.state.toggledPopover} toggle={this.togglePopover}/>
                </td>
                <td>
                  <Button onClick={() => {
                    this.expandContent(index)
                  }} style={{padding: 0}} color="link"><i
                      className="fa fa-search fa-lg"></i></Button>
                </td>
              </tr>
          )
        }
      })
    })
  }

  renderCargo() {
    if (this.state.activeTab !== '2') {
      return
    }

    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

    return this.state.rows.map((row, index) => {
      return row.map((r) => {
        if (r.message || r.message === "") {
          return (
              <tr style={{height: 0}}>
                <td colSpan='10' style={{padding: 0, border: 0}}>
                  <Collapse isOpen={this.state.collapse[index]}>
                    <Card>
                      <CardHeader>
                        <i className="fa fa-align-justify"></i> Mail Content
                      </CardHeader>
                      <CardBody style={{padding: 0, height: 500 + 'px'}}>
                        <Input style={{height: 500 + 'px'}} value={r.message} type="textarea" name="textarea-input" id="textarea-input" rows="9"/>
                      </CardBody>
                    </Card>
                  </Collapse>
                </td>
              </tr>
          )
        } else {
          return (
              <tr>
                <td style={tdStyle} title='Cargo Filter'>Cargo Filter</td>
                <td style={tdStyle} title={r.email.cargo_name ? r.email.cargo_name : '-'}>{r.email.cargo_name ? r.email.cargo_name : '-'}</td>
                {/*<td style={tdStyle} title={r.email.spec ? r.email.spec : '-'}>{r.email.spec ? r.email.spec : '-'}</td>*/}
                <td style={tdStyle} title={r.email.quantity ? r.email.quantity : '-'}>{r.email.quantity ? r.email.quantity : '-'}</td>
                <td style={tdStyle} title={r.email.loading_port ? r.email.loading_port : '-'}>{r.email.loading_port ? r.email.loading_port : '-'}</td>
                <td style={tdStyle}
                    title={r.email.discharging_port ? r.email.discharging_port : '-'}>{r.email.discharging_port ? r.email.discharging_port : '-'}</td>
                <td style={tdStyle} title={r.email.laycan ? r.email.laycan : '-'}>{r.email.laycan ? r.email.laycan : '-'}</td>
                <td style={tdStyle} title={r.from}>{r.from}</td>
                <td style={tdStyle} title={r.received}>{r.received}</td>
                <td>
                  <Button id={'tonnage-' + index} onClick={() => {
                    this.togglePopover(index)
                  }} style={{padding: 0}} color="link"><i className="fa fa-search fa-lg"></i></Button>
                  <PopoverItem key={index} id={index} toggleIndex={this.state.toggledPopover} toggle={this.togglePopover}/>
                </td>
                <td>
                  <Button onClick={() => {
                    this.expandContent(index)
                  }} style={{padding: 0}} color="link"><i
                      className="fa fa-search fa-lg"></i></Button>
                </td>
              </tr>
          )
        }
      })
    })
  }

  renderTc() {
    if (this.state.activeTab !== '3') {
      return
    }
    if (this.state.totalPage === 0) {
      return (
          <tr>
            <td colSpan='10' align="middle" style={{border: 1 + 'px'}}>No data.</td>
          </tr>
      )
    }

    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

    return this.state.rows.map((row, index) => {
      return row.map((r) => {
        if (r.message || r.message === "") {
          return (
              <tr style={{height: 0}}>
                <td colSpan='10' style={{padding: 0, border: 0}}>
                  <Collapse isOpen={this.state.collapse[index]}>
                    <Card>
                      <CardHeader>
                        <i className="fa fa-align-justify"></i> Mail Content
                      </CardHeader>
                      <CardBody style={{padding: 0, height: 500 + 'px'}}>
                        <Input style={{height: 500 + 'px'}} value={r.message} type="textarea" name="textarea-input" id="textarea-input" rows="9"/>
                      </CardBody>
                    </Card>
                  </Collapse>
                </td>
              </tr>
          )
        } else {
          return (
              <tr>
                <td style={tdStyle} title='Filter1'>Filter1</td>
                <td style={tdStyle} title={r.email.account ? r.email.account : '-'}>{r.email.account ? r.email.account : '-'}</td>
                {/*<td style={tdStyle} title={r.email.spec ? r.email.spec : '-'}>{r.email.spec ? r.email.spec : '-'}</td>*/}
                <td style={tdStyle} title={r.email.quantity ? r.email.quantity : '-'}>{r.email.quantity ? r.email.quantity : '-'}</td>
                <td style={tdStyle}
                    title={r.email.delivery_area ? r.email.delivery_area : '-'}>{r.email.delivery_area ? r.email.delivery_area : '-'}</td>
                <td style={tdStyle}
                    title={r.email.redelivery_area ? r.email.redelivery_area : '-'}>{r.email.redelivery_area ? r.email.redelivery_area : '-'}</td>
                <td style={tdStyle} title={r.email.laycan ? r.email.laycan : '-'}>{r.email.laycan ? r.email.laycan : '-'}</td>
                <td style={tdStyle} title={r.from}>{r.from}</td>
                <td style={tdStyle} title={r.received}>{r.received}</td>
                <td>
                  <Button style={{padding: 0}} color="link"><i
                      className="fa fa-search fa-lg"></i></Button>
                </td>
                <td>
                  <Button onClick={() => {
                    this.expandContent(index)
                  }} style={{padding: 0}} color="link"><i
                      className="fa fa-search fa-lg"></i></Button>
                </td>
              </tr>
          )
        }
      })
    })
  }


  handleReceivedChange = e => {
    this.setState({received: e.target.value});
  };

  handleSearchClick = () => {
    this.fetchData();
  };

  handlePrevBokck = () => {
    let minPage = 1 + (this.state.activeBlock - 1) * 5;
    this.setState({activeBlock: this.state.activeBlock - 1, activePage: minPage - 1}, this.fetchData)
  };

  handleNextBokck = () => {
    let maxPage = 5 + (this.state.activeBlock - 1) * 5
    this.setState({activeBlock: this.state.activeBlock + 1, activePage: maxPage + 1}, this.fetchData)
  };

  renderPrevPage() {
    if (this.state.activeBlock > 1) {
      return (
          <PaginationItem style={{display: 'inline-block'}}>
            <PaginationLink onClick={this.handlePrevBokck} previous tag="button"></PaginationLink>
          </PaginationItem>
      )
    }
  }

  renderNextPage() {
    if (this.state.activeBlock < this.state.totalBlock) {
      return (
          <PaginationItem style={{display: 'inline-block'}}>
            <PaginationLink onClick={this.handleNextBokck} next tag="button"></PaginationLink>
          </PaginationItem>
      )
    }
  }

  renderActivePage() {
    if (this.state.totalPage === 0) {
      return;
    }

    let pageCount = 0;
    if (this.state.activeBlock < this.state.totalBlock || this.state.totalPage % this.PAGE_PER_BLOCK === 0) {
      pageCount = this.PAGE_PER_BLOCK
    } else {
      pageCount = this.state.totalPage % this.PAGE_PER_BLOCK
    }

    const pageArray = [];
    for (let i = 0; i < pageCount; i++) {
      const pageNum = i + 1 + (this.state.activeBlock - 1) * this.PAGE_PER_BLOCK;
      pageArray.push(
          <PaginationItem style={{display: 'inline-block'}} active={this.state.activePage === pageNum}>
            <PaginationLink onClick={() => {
              this.handlePageChange(pageNum)
            }} tag="button">{pageNum}</PaginationLink>
          </PaginationItem>
      )
    }

    return (
        pageArray
    )
  }

  handlePageChange = (page) => {
    this.setState({activePage: page}, this.fetchData)
  };

  renderPage() {
    return (
        <Pagination style={{margin: '0 auto 0 auto', display: 'table'}}>
          {this.renderPrevPage()}
          {this.renderActivePage()}
          {this.renderNextPage()}
        </Pagination>
    )
  }

  render() {
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" lg="12">
              <Nav tabs>
                <NavItem>
                  <NavLink className={classnames({active: this.state.activeTab === '1'})}
                           onClick={() => {
                             this.toggle('1');
                           }}>
                    Tonnage
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className={classnames({active: this.state.activeTab === '2'})}
                           onClick={() => {
                             this.toggle('2');
                           }}>
                    Cargo
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className={classnames({active: this.state.activeTab === '3'})}
                           onClick={() => {
                             this.toggle('3');
                           }}>
                    TC
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                  <Card>
                    <CardBody>
                      <Form inline>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputName2" className="pr-1">Vessel</Label>
                          <Input type="text" id="exampleInputName2" placeholder="Vessel" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">DWT</Label>
                          <Input type="email" id="exampleInputEmail2" placeholder="DWT" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">BLT</Label>
                          <Input type="text" id="exampleInputEmail2" placeholder="Open Area" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Open Area</Label>
                          <Input type="text" id="exampleInputEmail2" placeholder="Open Area" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Open Date</Label>
                          <Input type="date" id="exampleInputEmail2" placeholder="Open Date" required/>
                        </FormGroup>
                      </Form>
                      <Form action="" method="post" inline>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label style={{width: 42 + 'px'}} htmlFor="exampleInputName2" className="pr-1">From</Label>
                          <Input type="text" id="exampleInputName2" placeholder="From" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Received</Label>
                          <Input value={this.state.received} onChange={this.handleReceivedChange} type="date" id="exampleInputEmail2"
                                 placeholder="DWT" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Filter</Label>
                          <Input type="email" id="exampleInputEmail2" placeholder="Filter" required/>
                        </FormGroup>
                      </Form>
                    </CardBody>
                    <CardFooter>
                      <FormGroup>
                        <Button className="btn btn-outline-primary" size='sm' style={{float: 'right'}}><i
                            className="fa fa-file-excel-o"></i> Excel</Button>
                        <Button color="primary" size='sm' style={{float: 'right',marginRight: 5}} onClick={this.handleSearchClick}><i
                            className="fa fa-search"></i> Search</Button>
                      </FormGroup>
                    </CardFooter>
                  </Card>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '9%'}}/>
                      <col/>
                      <col style={{width: '8%'}}/>
                      <col style={{width: '8%'}}/>
                      <col/>
                      <col style={{width: '8%'}}/>
                      <col/>
                      <col style={{width: '11%'}}/>
                      <col style={{width: '5%'}}/>
                      <col style={{width: '5%'}}/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>Filter Name</th>
                      <th style={{verticalAlign: 'middle'}}>Vessel Name</th>
                      {/*<th style={{verticalAlign: 'middle'}}>Spec</th>*/}
                      <th style={{verticalAlign: 'middle'}}>DWT</th>
                      <th style={{verticalAlign: 'middle'}}>BLT</th>
                      <th style={{verticalAlign: 'middle'}}>Open Area</th>
                      <th style={{verticalAlign: 'middle'}}>Open Date</th>
                      <th style={{verticalAlign: 'middle'}}>From</th>
                      <th style={{verticalAlign: 'middle'}}>Received</th>
                      <th style={{verticalAlign: 'middle'}}>Contact Info</th>
                      <th style={{verticalAlign: 'middle'}}>Mail body</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderTonnage()}
                    </tbody>
                  </Table>
                  {this.renderPage()}
                </TabPane>
                <TabPane tabId="2">
                  <Card>
                    <CardBody>
                      <Form action="" method="post" inline>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputName2" className="pr-1">Cargo</Label>
                          <Input type="text" id="exampleInputName2" placeholder="Cargo" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Quantity</Label>
                          <Input type="email" id="exampleInputEmail2" placeholder="Quantity" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">LD</Label>
                          <Input type="text" id="exampleInputEmail2" placeholder="LD" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">DIS</Label>
                          <Input type="text" id="exampleInputEmail2" placeholder="DIS" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">LAYCAN</Label>
                          <Input type="date" id="exampleInputEmail2" placeholder="LAYCAN" required/>
                        </FormGroup>
                      </Form>
                      <Form action="" method="post" inline>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label style={{width: 42 + 'px'}} htmlFor="exampleInputName2" className="pr-1">From</Label>
                          <Input type="text" id="exampleInputName2" placeholder="From" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Received</Label>
                          <Input value={this.state.received} onChange={this.handleReceivedChange} type="date" id="exampleInputEmail2"
                                 placeholder="DWT" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Filter</Label>
                          <Input type="email" id="exampleInputEmail2" placeholder="Filter" required/>
                        </FormGroup>
                      </Form>
                    </CardBody>
                    <CardFooter>
                      <Button className="btn btn-outline-primary" size="sm" color="danger" style={{float: 'right'}}><i
                          className="fa fa-file-excel-o"></i> Excel</Button>
                      <Button size="sm" color="primary" style={{float: 'right',marginRight: 5}}><i className="fa fa-search"></i> Search</Button>
                    </CardFooter>
                  </Card>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '9%'}}/>
                      <col/>
                      <col style={{width: '7%'}}/>
                      <col/>
                      <col/>
                      <col/>
                      <col/>
                      <col style={{width: '11%'}}/>
                      <col style={{width: '5%'}}/>
                      <col style={{width: '5%'}}/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>Filter Name</th>
                      <th style={{verticalAlign: 'middle'}}>Cargo Name</th>
                      <th style={{verticalAlign: 'middle'}}>Quantity</th>
                      <th style={{verticalAlign: 'middle'}}>Loading Port</th>
                      <th style={{verticalAlign: 'middle'}}>Discharging Port</th>
                      <th style={{verticalAlign: 'middle'}}>LayCan</th>
                      <th style={{verticalAlign: 'middle'}}>From</th>
                      <th style={{verticalAlign: 'middle'}}>Received</th>
                      <th style={{verticalAlign: 'middle'}}>Contact Info</th>
                      <th style={{verticalAlign: 'middle'}}>Mail body</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderCargo()}
                    </tbody>
                  </Table>
                  {this.renderPage()}
                </TabPane>
                <TabPane tabId="3">
                  <Card>
                    <CardBody>
                      <Form action="" method="post" inline>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputName2" className="pr-1">Account</Label>
                          <Input type="text" id="exampleInputName2" placeholder="Account" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Quantity</Label>
                          <Input type="email" id="exampleInputEmail2" placeholder="Quantity" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Delivery</Label>
                          <Input type="text" id="exampleInputEmail2" placeholder="Delivery" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Redelivery</Label>
                          <Input type="text" id="exampleInputEmail2" placeholder="Redelivery" required/>
                        </FormGroup>
                      </Form>
                      <Form action="" method="post" inline>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label style={{width: 42 + 'px'}} htmlFor="exampleInputName2" className="pr-1">From</Label>
                          <Input type="text" id="exampleInputName2" placeholder="From" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Received</Label>
                          <Input value={this.state.received} onChange={this.handleReceivedChange} type="date" id="exampleInputEmail2"
                                 placeholder="DWT" required/>
                        </FormGroup>
                        <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                          <Label htmlFor="exampleInputEmail2" className="pr-1">Filter</Label>
                          <Input type="email" id="exampleInputEmail2" placeholder="Filter" required/>
                        </FormGroup>
                      </Form>
                    </CardBody>
                    <CardFooter>
                      <Button className="btn btn-outline-primary" size="sm" color="danger" style={{float: 'right'}}><i
                          className="fa fa-file-excel-o"></i> Excel</Button>
                      <Button size="sm" color="primary" style={{float: 'right', marginRight: 5}}><i className="fa fa-search"></i> Search</Button>
                    </CardFooter>
                  </Card>
                  <Table responsive>
                    <col style={{width: '9%'}}/>
                    <col/>
                    <col style={{width: '7%'}}/>
                    <col/>
                    <col/>
                    <col/>
                    <col/>
                    <col style={{width: '11%'}}/>
                    <col style={{width: '5%'}}/>
                    <col style={{width: '5%'}}/>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>Filter Name</th>
                      <th style={{verticalAlign: 'middle'}}>Account</th>
                      <th style={{verticalAlign: 'middle'}}>Quantity</th>
                      <th style={{verticalAlign: 'middle'}}>Delivery Area</th>
                      <th style={{verticalAlign: 'middle'}}>Redelivery Area</th>
                      <th style={{verticalAlign: 'middle'}}>LayCan</th>
                      <th style={{verticalAlign: 'middle'}}>From</th>
                      <th style={{verticalAlign: 'middle'}}>Received</th>
                      <th style={{verticalAlign: 'middle'}}>Contact Info</th>
                      <th style={{verticalAlign: 'middle'}}>Mail body</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderTc()}
                    </tbody>
                  </Table>
                  {this.renderPage()}
                </TabPane>
              </TabContent>
            </Col>
          </Row>
          <Modal className={this.props.className}>
            <ModalHeader toggle={this.popupModel}>
              Phone : 82-2-300-3000
              Mobile : 82-10-3000-4000
              Skype : Broker.Kim
              Email : bk@mail.com
            </ModalHeader>
            <ModalBody style={{padding: 6 + 'px'}}>
              <FormGroup row>
                <Col xs="12" md="12">
                  <Input type="textarea" name="textarea-input" rows='5' id="textarea-input" placeholder="Content..."/>
                </Col>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.popupModel}>Send Mail</Button>{' '}
              <Button color="secondary" onClick={this.popupModel}>Cancel</Button>
            </ModalFooter>
          </Modal>
        </div>

    );
  }
}