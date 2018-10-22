import React, {Component} from 'react';
import {Doughnut, Line} from 'react-chartjs-2';
import {
  Button,
  ButtonDropdown,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Progress,
  Row,
  Table
} from 'reactstrap';
import moment from 'moment'
import axios from "axios";
import Widget04 from '../Widgets/Widget04';
import * as HttpStatus from "http-status-codes/index";

const brandPrimary = '#20a8d8';
const brandSuccess = '#4dbd74';
const brandInfo = '#63c2de';
const brandWarning = '#f8cb00';
const brandDanger = '#f86c6b';

// Card Chart 2
const cardChartData2 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: brandInfo,
      borderColor: 'rgba(255,255,255,.55)',
      data: [1, 18, 9, 17, 34, 22, 11],
    },
  ],
};

const cardChartOpts2 = {
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent',
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },

      }],
    yAxes: [
      {
        display: false,
        ticks: {
          display: false,
          min: Math.min.apply(Math, cardChartData2.datasets[0].data) - 5,
          max: Math.max.apply(Math, cardChartData2.datasets[0].data) + 5,
        },
      }],
  },
  elements: {
    line: {
      tension: 0.00001,
      borderWidth: 1,
    },
    point: {
      radius: 4,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};

// convert Hex to RGBA
function convertHex(hex, opacity) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  return result;
}

const mainChartOpts = {
  maintainAspectRatio: false,
  legend: {
    display: true,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false,
        },
      }],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          //stepSize: Math.ceil(250 / 5),
          //max: 250,
        },
      }],
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
};

class ActivitySummary extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);

    this.state = {
      dropdownOpen: false,
      toDay: moment(new Date()).format('YYYY-MM-DD'),
      visitUserInterval: 'Day',
      visitChangeInterval: 1,
      pageViewInterval: 1,
      signupInterval: 1,
      purchaseInterval: 1,
      visitUser: {
        total: 0,
        member: 0,
        mRatio: 0,
        customer: 0,
        cRatio: 0,
        return: 0,
        rRatio: 0,
        new: 0,
        nRatio: 0
      },
      visitChangeChart: {
        labels: [],
        datasets: []
      },
      topPage: [],
      signupChart: {
        labels: [],
        datasets: [{data: [1]}]
      },
      purchaseChart: {
        labels: [],
        datasets: [{data: [1]}]
      }
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  componentDidMount() {
    this.fetchVisitUser();
    this.fetchVisitChange();
    this.fetchTopPage();
    this.fetchSignUp();
    this.fetchPurchase();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSite !== prevProps.selectedSite) {
      this.fetchVisitUser();
      this.fetchVisitChange();
      this.fetchTopPage();
      this.fetchSignUp();
      this.fetchPurchase();
    }
  }


  fetchPurchase = () => {
    const {purchaseInterval} = this.state;
    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (purchaseInterval) {
      case 1:
        fromDate = toDay + '||/d';
        break;
      case 2:
        fromDate = toDay + '||-7d/d';
        break;
      case 3:
        fromDate = toDay + '||-1M/d';
        break;
    }

    axios({
      method: 'post',
      url: '/activity/summary/purchase',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          console.log(response);
          if (response.data.customer !== 0 || response.data.member !== 0) {
            this.setState({
              purchaseChart: {
                labels: [
                  'A Customer',
                  'A Member'
                ],
                datasets: [
                  {
                    data: [response.data.customer, response.data.member],
                    backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                    ],
                    hoverBackgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                    ],
                  }],
              }
            });
          }
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  };


  fetchSignUp = () => {
    const {signupInterval} = this.state;
    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (signupInterval) {
      case 1:
        fromDate = toDay + '||/d';
        break;
      case 2:
        fromDate = toDay + '||-7d/d';
        break;
      case 3:
        fromDate = toDay + '||-1M/d';
        break;
    }

    axios({
      method: 'post',
      url: '/activity/summary/sign_up',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          console.log(response);
          if (response.data.first_visit !== 0 || response.data.return_visit !== 0) {
            this.setState({
              signupChart: {
                labels: [
                  'First Visit',
                  'Return Visit'
                ],
                datasets: [
                  {
                    data: [response.data.first_visit, response.data.return_visit],
                    backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                    ],
                    hoverBackgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                    ],
                  }],
              }
            });
          }
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  };

  fetchTopPage = () => {
    const {pageViewInterval} = this.state;
    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (pageViewInterval) {
      case 1:
        fromDate = toDay + '||/d';
        break;
      case 2:
        fromDate = toDay + '||-7d/d';
        break;
      case 3:
        fromDate = toDay + '||-1M/d';
        break;
    }

    axios({
      method: 'post',
      url: '/activity/summary/top_page',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          console.log(response);
          if (response.data === null) {
            this.setState({topPage: []});
            return;
          }
          this.setState({topPage: response.data})
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )

  };


  fetchVisitChange = () => {
    const {visitChangeInterval} = this.state;
    const chartDatas = {
      labels: [],
      datasets: [
        {
          label: 'A Customer + A Member',
          backgroundColor: convertHex(brandInfo, 10),
          borderColor: brandInfo,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: null,
        },
        {
          label: 'NEW USERS',
          backgroundColor: 'transparent',
          borderColor: brandSuccess,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: null,
        },
        {
          label: 'RETURNING USERS',
          backgroundColor: 'transparent',
          borderColor: brandDanger,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: null,
        }
      ]
    };

    const currentDate = new Date();
    let fromDate = null;
    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let toDate = toDay + '||/d';
    let format = 'yyyy-MM-dd';
    let keyFormat = null;
    let interval = null;
    let itr = null;

    switch (visitChangeInterval) {
      case 1: // Day
        chartDatas.labels = [];
        itr = moment(moment(currentDate).format('YYYY-MM-DD') + " 00:00").twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("hours");
        fromDate = toDay + '||/d';
        keyFormat = "HH";
        interval = '1h';
        break;
      case 2: // Week
        chartDatas.labels = [];
        itr = moment(moment(currentDate).subtract(7, 'days').format('YYYY-MM-DD HH:mm')).twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("days");
        fromDate = toDay + '||-7d/d';
        keyFormat = "MM-DD";
        interval = '1d';
        break;
      case 3: //Month
        chartDatas.labels = [];
        itr = moment(moment(currentDate).subtract(1, 'months').format('YYYY-MM-DD HH:mm')).twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("days");
        fromDate = toDay + '||-1M/d';
        keyFormat = "MM-DD";
        interval = '1d';
        break;
    }

    while (itr.hasNext()) {
      chartDatas.labels.push(itr.next().format(keyFormat));
    }

    axios({
      method: 'post',
      url: '/activity/summary/visit_change',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        format: format,
        interval: interval,
        timeZone: moment.tz.guess()
      }
    }).then(
        (response) => {
          //console.log(response);
          const total = [];
          const n = [];
          const r = [];
          for (let i = 0; i < chartDatas.labels.length; i++) {
            total.push(0);
            n.push(0);
            r.push(0);
          }

          if (response.data.key !== null) {
            response.data.key.map((k, i) => {
              const label = moment(k).format(keyFormat);
              const labelIndex = chartDatas.labels.indexOf(label);
              if (labelIndex != -1) {
                total[labelIndex] = response.data.total[i];
                n[labelIndex] = response.data.new[i];
                r[labelIndex] = response.data.return[i];
              }
            });
          }
          chartDatas.datasets[0].data = total;
          chartDatas.datasets[1].data = n;
          chartDatas.datasets[2].data = r;

          this.setState({visitChangeChart: chartDatas});
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  };

  fetchVisitUser = () => {
    const {visitUserInterval} = this.state;
    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (visitUserInterval) {
      case 'Day':
        fromDate = toDay + '||/d';
        break;
      case 'Week':
        fromDate = toDay + '||-7d/d';
        break;
      case 'Month':
        fromDate = toDay + '||-1M/d';
        break;
    }

    axios({
      method: 'post',
      url: '/activity/summary/visit_user',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          console.log(response);
          let visitUser = response.data;
          visitUser.mRatio = visitUser.total == 0 ? 0 : (visitUser.member / visitUser.total * 100).toFixed(2);
          visitUser.cRatio = visitUser.total == 0 ? 0 : (visitUser.customer / visitUser.total * 100).toFixed(2);

          visitUser.nRatio = visitUser.total == 0 ? 0 : (visitUser.new / visitUser.total * 100).toFixed(2);
          visitUser.rRatio = visitUser.total == 0 ? 0 : (visitUser.return / visitUser.total * 100).toFixed(2);

          this.setState({visitUser: visitUser})
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )

  };

  onDropDownClick = (e) => {
    this.setState({visitUserInterval: e.target.value}, this.fetchVisitUser);
  };

  onVisitChangeBtnClick = (interval) => {
    this.setState({visitChangeInterval: interval}, this.fetchVisitChange);
  };

  onPageViewBtnClick = (interval) => {
    this.setState({pageViewInterval: interval}, this.fetchTopPage);
  };

  onSignupBtnClick = (interval) => {
    this.setState({signupInterval: interval}, this.fetchSignUp);
  };

  onPurchaseBtnClick = (interval) => {
    this.setState({purchaseInterval: interval}, this.fetchPurchase);
  };

  renderTopPage() {
    const {topPage} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'};

    if (topPage.length == 0) {
      return (
          <tr>
            <td colSpan={6} style={{textAlign: 'center'}}>No data.</td>
          </tr>
      )
    } else {
      return (
          topPage.map((row, i) =>
              <tr key={i}>
                <td>{i + 1}</td>
                <td title={row.page} style={tdStyle}>{row.page}</td>
                <td>{row.desc}</td>
                <td>{row.count}</td>
                <td>{row.ratio}</td>
                <td><Progress className="progress-sm mt-2" color="danger" value={row.ratio}/></td>
              </tr>
          )
      )
    }
  }

  render() {
    const {visitUserInterval, visitChangeInterval, pageViewInterval, signupInterval, purchaseInterval, visitUser, visitChangeChart, signupChart, purchaseChart} = this.state;
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" sm="4" lg="4">
              <Card className="text-white bg-info" style={{marginBottom: 0, height: 164 + 'px'}}>
                <CardBody className="pb-0">
                  <ButtonGroup className="float-right">
                    <ButtonDropdown id='card1' isOpen={this.state.card1} toggle={() => {
                      this.setState({card1: !this.state.card1});
                    }}>
                      <DropdownToggle caret className="p-0" color="transparent">
                        {visitUserInterval}
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem onClick={this.onDropDownClick} value='Day'>Day</DropdownItem>
                        <DropdownItem onClick={this.onDropDownClick} value='Week'>Week</DropdownItem>
                        <DropdownItem onClick={this.onDropDownClick} value='Month'>Month</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </ButtonGroup>
                  <h4 className="mb-0">{visitUser.total}</h4>
                  <p>A Customer + A Member</p>
                </CardBody>
                <div className="chart-wrapper px-3" style={{height: '70px'}}>
                  <Line data={cardChartData2} options={cardChartOpts2} height={70}/>
                </div>
              </Card>
            </Col>
            <Col xs="12" sm="4" lg="4">
              <CardGroup className="mb-4">
                <Widget04 icon="icon-people" color="info" header={visitUser.member} value={visitUser.mRatio}>A Member</Widget04>
                <Widget04 icon="icon-user-follow" color="success" header={visitUser.customer} value={visitUser.cRatio}>A Customer</Widget04>
              </CardGroup>
            </Col>
            <Col xs="12" sm="4" lg="4">
              <CardGroup className="mb-4">
                <Widget04 icon="icon-people" color="info" header={visitUser.return} value={visitUser.rRatio}>Returning Users</Widget04>
                <Widget04 icon="icon-user-follow" color="success" header={visitUser.new} value={visitUser.nRatio}>New Users</Widget04>
              </CardGroup>
            </Col>
          </Row>

          <Row>
            <Col xs="12" sm="12" lg="12">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>A Customer + A Member</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onVisitChangeBtnClick(1)}
                                  active={visitChangeInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onVisitChangeBtnClick(2)}
                                  active={visitChangeInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onVisitChangeBtnClick(3)}
                                  active={visitChangeInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper" style={{height: 300 + 'px'}}>
                    <Line data={visitChangeChart} options={mainChartOpts} height={300}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xs="12" sm="12" lg="12">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Top Popular Pages - All Users</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPageViewBtnClick(1)}
                                  active={pageViewInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPageViewBtnClick(2)}
                                  active={pageViewInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPageViewBtnClick(3)}
                                  active={pageViewInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Table responsive style={{margin: 0}}>
                      <colgroup>
                        <col width="10%"/>
                        <col/>
                        <col width="10%"/>
                        <col width="10%"/>
                        <col width="10%"/>
                        <col width="30%"/>
                      </colgroup>
                      <thead>
                      <tr>
                        <th>No</th>
                        <th>Page Name</th>
                        <th>Description</th>
                        <th>Count</th>
                        <th>Rate(%)</th>
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.renderTopPage()}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Registrations</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onSignupBtnClick(1)}
                                  active={signupInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onSignupBtnClick(2)}
                                  active={signupInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onSignupBtnClick(3)}
                                  active={signupInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Doughnut data={signupChart}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Purchases</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPurchaseBtnClick(1)}
                                  active={purchaseInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPurchaseBtnClick(2)}
                                  active={purchaseInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPurchaseBtnClick(3)}
                                  active={purchaseInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Doughnut data={purchaseChart}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
    )
  }
}

export default ActivitySummary;
