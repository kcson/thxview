import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Progress, Row} from 'reactstrap';
import {scaleLinear} from "d3-scale";
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";
import Widget04 from '../Widgets/Widget04';
import * as HttpStatus from "http-status-codes/index";
import {numberWithCommas} from '../Util/CommonUtils';
import ActiveLocation from "./ActiveLocation";
import TopPage from "./TopPage";
import TrafficSource from "./TrafficSource";
import OS from "./OS";
import Browser from "./Browser";

const cityScale = scaleLinear()
    .domain([0, 37843000])
    .range([1, 25]);

const brandPrimary = '#20a8d8';
const brandSuccess = '#4dbd74';
const brandInfo = '#63c2de';
const brandWarning = '#f8cb00';
const brandDanger = '#f86c6b';

// Main Chart
// convert Hex to RGBA
function convertHex(hex, opacity) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  return result;
}

//Random Numbers
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50, 200));
  data2.push(random(80, 100));
  data3.push(65);
}

const pageViewChartOpts = {
  maintainAspectRatio: false,
  legend: {
    display: false,
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

const colorFamily = [
  "#0074D9",
  "#FF4136",
  "#2ECC40",
  "#FF851B",
  "#7FDBFF",
  "#B10DC9",
  "#FFDC00",
  "#001f3f",
  "#39CCCC",
  "#01FF70",
  "#85144b",
  "#F012BE",
  "#3D9970",
  "#111111",
  "#AAAAAA"];

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);

    this.state = {
      pageViewInterval: 1,
      conversionInterval: 1,
      purchaseInterval: 1,
      dropdownOpen: false,
      toDay: moment(new Date()).format('YYYY-MM-DD'),
      activeUser: 0,
      cities: [],
      pageViewChart: {
        labels: [],
        datasets: []
      },
      visitUser: 0,
      signupUser: 0,
      signupRatio: 0,
      purchaseCount: 0,
      purchasePrice: 0,
      purchase: null,
      visitorRatio: 0,
      memberRatio: 0,
      pcRatio: 0,
      mobileRatio: 0,
      browserChartData: {
        labels: [],
        datasets: []
      },
      center: {
        lat: 36.8929,
        lng: 76.1468
      },
      zoom: 1
    };
  }

  activeUSerTimer = null;
  pageViewTimer = null;
  conversionTimer = null;
  purchaseTimer = null;
  browserTimer = null;

  componentDidUpdate(prevProps) {
    if (this.props.selectedSite !== prevProps.selectedSite) {
      this.fetchActiveUser();
      this.fetchPageView();
      this.fetchConversion();
      this.fetchPurchase();
      this.fetchBrowser();
    }
  }

  componentDidMount() {
    this.fetchActiveUser();
    this.fetchPageView();
    this.fetchConversion();
    this.fetchPurchase();
    this.fetchBrowser();

    this.activeUSerTimer = setInterval(() => {
      this.fetchActiveUser();
    }, 20 * 1000);

    this.pageViewTimer = setInterval(() => {
      this.fetchPageView();
    }, 20 * 1000);

    this.conversionTimer = setInterval(() => {
      this.fetchConversion();
    }, 20 * 1000);

    this.purchaseTimer = setInterval(() => {
      this.fetchPurchase();
    }, 20 * 1000);

    this.browserTimer = setInterval(() => {
      this.fetchBrowser();
    }, 20 * 1000);
  }

  componentWillUnmount() {
    if (this.activeUSerTimer !== null) {
      clearInterval(this.activeUSerTimer);
    }

    if (this.pageViewTimer !== null) {
      clearInterval(this.pageViewTimer);
    }

    if (this.conversionTimer !== null) {
      clearInterval(this.conversionTimer);
    }

    if (this.purchaseTimer !== null) {
      clearInterval(this.purchaseTimer);
    }

    if (this.browserTimer !== null) {
      clearInterval(this.browserTimer);
    }
  }

  fetchBrowser() {
    const doughnut_browser = {
      labels: ['No data.'],
      datasets: [{
        data: [1],
        backgroundColor: [],
        hoverBackgroundColor: []
      }]
    };

    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = toDay + '||/d';
    let toDate = toDay + '||/d';

    axios({
      method: 'post',
      url: '/information/summary/browser',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          if (response.data == null) {
            this.setState({browserChartData: doughnut_browser});
            return;
          }
          const labels = [];
          const data = [];
          const backgroundColor = [];
          const hoverBackgroundColor = [];
          response.data.map((bucket, index) => {
            if (bucket.count == 0) {
              return
            }
            labels.push(bucket.name);
            data.push(bucket.count);
            const color = colorFamily[index % 15];
            backgroundColor.push(color)
            hoverBackgroundColor.push(color)
          });
          if (data.length > 0) {
            doughnut_browser.labels = labels;
            doughnut_browser.datasets = [];
            doughnut_browser.datasets.push(
                {
                  data: data,
                  backgroundColor: backgroundColor,
                  hoverBackgroundColor: hoverBackgroundColor
                }
            );
          }
          this.setState({browserChartData: doughnut_browser});
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )

  }

  fetchActiveUser() {
    let toDay = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    axios({
      method: 'post',
      url: '/dashboard/activeuser',
      data: {
        fromDate: toDay,
        toDate: toDay,
        timeZone: moment.tz.guess(),
      }
    }).then(
        (response) => {
          const visitorRatio = response.data.activeuser_count == 0 ? 0 : (response.data.visitor_count / response.data.activeuser_count * 100).toFixed(2);
          const memberRatio = response.data.activeuser_count == 0 ? 0 : (response.data.member_count / response.data.activeuser_count * 100).toFixed(2);
          const pcRatio = response.data.activeuser_count == 0 ? 0 : (response.data.pc_count / response.data.activeuser_count * 100).toFixed(2);
          const mobileRatio = response.data.activeuser_count == 0 ? 0 : (response.data.mobile_count / response.data.activeuser_count * 100).toFixed(2);

          this.setState({activeUser: response.data.activeuser_count, visitorRatio, memberRatio, pcRatio, mobileRatio});
        },
        (err) => {
          console.log(err);
        }
    )
  }

  fetchPageView() {
    const chartDatas = {
      labels: [],
      datasets: [
        {
          label: 'Page View',
          backgroundColor: convertHex(brandInfo, 10),
          borderColor: brandInfo,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: null,
        },
      ]
    };

    const currentDate = new Date();
    let fromDate = null;
    let toDate = null;
    let format = null;
    let keyFormat = null;
    let interval = null;
    let itr = null;

    switch (this.state.pageViewInterval) {
      case 1: // 시간
        chartDatas.labels = [];
        itr = moment(moment(currentDate).subtract(1, 'hours').format('YYYY-MM-DD HH:mm')).twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("minutes");
        fromDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||-60m/m';
        toDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||/m';
        format = 'yyyy-MM-dd HH:mm';
        keyFormat = "HH:mm";
        interval = '1m';
        break;
      case 2: //day
        chartDatas.labels = [];
        itr = moment(moment(currentDate).format('YYYY-MM-DD') + " 00:00").twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("hours");
        fromDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        toDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        format = 'yyyy-MM-dd';
        keyFormat = "HH";
        interval = '1h';
        break;
    }

    while (itr.hasNext()) {
      chartDatas.labels.push(itr.next().format(keyFormat));
    }

    axios({
      method: 'post',
      url: '/dashboard/pageview',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        format: format,
        interval: interval,
        timeZone: moment.tz.guess()
      }
    }).then(
        (response) => {
          //console.log(response.data.aggregations.page_view);
          const lineData = [];
          const buckets = response.data.aggregations.page_view.buckets;
          for (let i = 0; i < chartDatas.labels.length; i++) {
            lineData.push(0);
          }
          buckets.map((bucket, index) => {
            const key = moment(bucket.key).format(keyFormat);
            const keyIndex = chartDatas.labels.indexOf(key);
            if (keyIndex !== -1) {
              lineData[keyIndex] = bucket['doc_count'];
            }
          });

          chartDatas.datasets[0].data = lineData;
          //console.log(chartDatas);
          this.setState({pageViewChart: chartDatas});

        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  }

  fetchConversion() {
    const currentDate = new Date();
    let fromDate = null;
    let toDate = null;
    let format = null;
    let keyFormat = null;
    let interval = null;
    let itr = null;

    switch (this.state.conversionInterval) {
      case 1: // 시간
        itr = moment(moment(currentDate).subtract(1, 'hours').format('YYYY-MM-DD HH:mm')).twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("minutes");
        fromDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||-60m/m';
        toDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||/m';
        format = 'yyyy-MM-dd HH:mm';
        keyFormat = "HH:mm";
        interval = '1m';
        break;
      case 2: //day
        itr = moment(moment(currentDate).format('YYYY-MM-DD') + " 00:00").twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("hours");
        fromDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        toDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        format = 'yyyy-MM-dd';
        keyFormat = "HH";
        interval = '1h';
        break;
    }

    axios({
      method: 'post',
      url: '/dashboard/conversion',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        format: format,
        interval: interval,
        timeZone: moment.tz.guess()
      }
    }).then(
        (response) => {
          this.setState({
            visitUser: response.data.visit_user,
            signupUser: response.data.signup_user,
            signupRatio: response.data.signup_ratio,
          });
        },
        (err) => {
          console.log(err);
        }
    )
  }

  fetchPurchase() {
    const {purchaseInterval} = this.state;
    const currentDate = new Date();
    let fromDate = null;
    let toDate = null;
    let format = null;
    let keyFormat = null;
    let interval = null;
    let itr = null;

    switch (purchaseInterval) {
      case 1: // 시간
        itr = moment(moment(currentDate).subtract(1, 'hours').format('YYYY-MM-DD HH:mm')).twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("minutes");
        fromDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||-60m/m';
        toDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||/m';
        format = 'yyyy-MM-dd HH:mm';
        keyFormat = "HH:mm";
        interval = '1m';
        break;
      case 2: //day
        itr = moment(moment(currentDate).format('YYYY-MM-DD') + " 00:00").twix(moment(currentDate).format('YYYY-MM-DD HH:mm')).iterate("hours");
        fromDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        toDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        format = 'yyyy-MM-dd';
        keyFormat = "HH";
        interval = '1h';
        break;
    }

    axios({
      method: 'post',
      url: '/dashboard/purchase',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        format: format,
        interval: interval,
        timeZone: moment.tz.guess()
      }
    }).then(
        (response) => {
          this.setState({
            purchaseCount: response.data.purchase_count,
            purchasePrice: response.data.purchase_price,
            purchase: response.data.purchase,
          });
        },
        (err) => {
          console.log(err);
        }
    )
  }

  procuctName = {
    1: 'PlaSkin',
    2: 'PlaSkin Plus',
    3: 'Plabeau'
  };

  renderPuarchase() {
    const {purchasePrice, purchase} = this.state;
    if (purchase == null) {
      return null;
    } else {
      return (
          purchase.map((p) => {
            let productName = this.procuctName[p.product_id];
            let ratio = (p.price / purchasePrice * 100).toFixed(2);
            let quantity = numberWithCommas(p.quantity);
            let price = numberWithCommas(p.price);
            return (
                <div className="progress-group">
                  <div className="progress-group-header">
                    <span className="title">{productName + ' - ' + quantity + '($' + price + ')'}</span>
                    <span className="ml-auto font-weight-bold">{ratio + '%'}</span>
                  </div>
                  <div className="progress-group-bars">
                    <Progress className="progress-xs" color="warning" value={ratio}/>
                  </div>
                </div>
            )
          })
      )
    }
  }

  renderPuarchaseDetail() {
    const {purchase} = this.state;
    if (purchase == null) {
      return null;
    } else {
      return (
          <Col sm="12" md="6" className="pl-0">
            <ul className="pl-0">
              {this.renderPuarchase()}
            </ul>
          </Col>
      )
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  onPageViewBtnClick = (interval) => {
    this.setState({
      pageViewInterval: interval,
    }, this.fetchPageView);
  };

  onConversionBtnClick = (interval) => {
    this.setState({
      conversionInterval: interval,
    }, this.fetchConversion);
  };

  onPurchaseBtnClick = (interval) => {
    this.setState({
      purchaseInterval: interval,
    }, this.fetchPurchase);
  };

  render() {
    const {visitUser, signupUser, signupRatio, purchaseCount, purchasePrice, visitorRatio, memberRatio, pcRatio, mobileRatio, browserChartData} = this.state;
    const signupCount = signupUser + '(' + signupRatio + '%)';
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" sm="2" lg="3">
              <Card style={{height: 240 + 'px'}}>
                <CardHeader>
                  <strong>Active users on site</strong>
                </CardHeader>
                <CardBody style={{textAlign: 'center'}}>
                  <h1>{this.state.activeUser}</h1>
                  <Row style={{marginTop: '20px'}}>
                    <Col sm={12} md className="mb-sm-2 mb-0" style={{padding: 0}}>
                      <span style={{fontSize: 12 + 'px'}}>A Customer({visitorRatio}%)</span>
                      <Progress style={{backgroundColor: '#4dbd74'}} className="progress-xs mt-2" color="gray-100" value={100 - visitorRatio}/>
                    </Col>
                    <Col sm={12} md className="mb-sm-2 mb-0 d-md-down-none" style={{padding: 0}}>
                      <span style={{fontSize: 12 + 'px'}}>A Member({memberRatio}%)</span>
                      <Progress className="progress-xs mt-2" color="info" value={memberRatio}/>
                    </Col>
                  </Row>
                  <Row style={{marginTop: '10px'}}>
                    <Col sm={12} md className="mb-sm-2 mb-0" style={{padding: 0}}>
                      <span style={{fontSize: 12 + 'px'}}>PC({pcRatio}%)</span>
                      <Progress style={{backgroundColor: '#ffc107'}} className="progress-xs mt-2" color="gray-100" value={100 - pcRatio}/>
                    </Col>
                    <Col sm={12} md className="mb-sm-2 mb-0 d-md-down-none" style={{padding: 0}}>
                      <span style={{fontSize: 12 + 'px'}}>Mobile({mobileRatio}%)</span>
                      <Progress className="progress-xs mt-2" color="danger" value={mobileRatio}/>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="10" lg="9">
              <Card style={{height: 240 + 'px'}}>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Page views</strong></span>
                      {/*<span className="small text-muted">{this.state.toDay}</span>*/}
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPageViewBtnClick(1)}
                                  active={this.state.pageViewInterval === 1}>Hour</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPageViewBtnClick(2)}
                                  active={this.state.pageViewInterval === 2}>Day</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper" style={{height: 150 + 'px', marginTop: 10 + 'px'}}>
                    <Line data={this.state.pageViewChart} options={pageViewChartOpts} height={150}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xs="12" sm="12" lg="3">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Visit users</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onConversionBtnClick(1)}
                                  active={this.state.conversionInterval === 1}>Hour</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onConversionBtnClick(2)}
                                  active={this.state.conversionInterval === 2}>Day</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col sm="6" md="12">
                      <Widget04 icon="icon-people" color="info" header={visitUser} value="0">Visit (New Users)</Widget04>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="12" lg="3">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Registrations</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.onConversionBtnClick(1)}
                                  active={this.state.conversionInterval === 1}>Hour</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onConversionBtnClick(2)}
                                  active={this.state.conversionInterval === 2}>Day</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col sm="12" md="12">
                      <Widget04 icon="icon-user-follow" color="success" header={signupCount} value={signupRatio}>Registrations</Widget04>
                    </Col>
                  </Row>
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
                                  active={this.state.purchaseInterval === 1}>Hour</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.onPurchaseBtnClick(2)}
                                  active={this.state.purchaseInterval === 2}>Day</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col sm="12" md="6">
                      <Widget04 icon="icon-basket-loaded" color="warning"
                                header={numberWithCommas(purchaseCount) + '($' + numberWithCommas(purchasePrice) + ')'}
                                value={0}>Purchases</Widget04>
                    </Col>
                    {this.renderPuarchaseDetail()}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <TopPage selectedSite={this.props.selectedSite}/>
          <Row>
            <TrafficSource selectedSite={this.props.selectedSite}/>
          </Row>
          <Row>
            <OS selectedSite={this.props.selectedSite}/>
            <Browser selectedSite={this.props.selectedSite}/>
          </Row>
          <Row>
            <ActiveLocation selectedSite={this.props.selectedSite}/>
          </Row>
        </div>
    );
  }
}

export default Dashboard;
