import React, {Component} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Progress, Row, Table} from 'reactstrap';
import {ComposableMap, Geographies, Geography, Marker, Markers, ZoomableGroup} from "react-simple-maps";
import {scaleLinear} from "d3-scale";
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";
import LocationOverview from "./LocationOverview";

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

const doughnut_browser = {
  labels: [
    'Chrome',
    'IE',
    'Safari',
  ],
  datasets: [
    {
      data: [50, 30, 20],
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

class InformationSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inflowInterval: 1,
      osInterval: 1,
      browserInterval: 1,
      toDay: moment(new Date()).format('YYYY-MM-DD'),
      cities: [],
      inflowTopPage: [],
      osChartData: {
        labels: [],
        datasets: []
      },
      osChartDetail: [],
      osChartOption: this.doughnut_os_options,
      browserChartData: {
        labels: [],
        datasets: []
      },
    };
  }

  doughnut_os_options = {
    onClick: (event, items) => {
      console.log(items.length);
      if (items.length == 0) {
        return;
      }
      const {osChartDetail} = this.state;
      const item = items[0];

      const chartData = osChartDetail[item._index];
      this.setState({
        osChartData: chartData, osChartOption: {
          onClick: (event, items) => {
          }
        }
      });
    }
  };

  //inflowTimer = null;

  componentDidMount() {
    this.fetchInflow();
    this.fetchOS();
    this.fetchBrowser();

    this.fetchMapData();
    // this.inflowTimer = setInterval(() => {
    //   this.fetchInflow();
    // }, 20 * 1000);
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
    // if (this.inflowTimer !== null) {
    //   clearInterval(this.inflowTimer);
    // }
  }

  fetchMapData = () => {
    axios
        .get("/public/static/world-most-populous-cities.json")
        .then(res => {
          this.setState({
            cities: res.data,
          })
        })
  };

  fetchBrowser() {
    const {browserInterval} = this.state;
    const doughnut_browser = {
      labels: ['No data.'],
      datasets: [{
        data: [1],
        backgroundColor: [],
        hoverBackgroundColor: []
      }]
    };

    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (browserInterval) {
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
      url: '/information/summary/browser',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          console.log(response);
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

  fetchOS() {
    const {osInterval} = this.state;
    const doughnut_os = {
      labels: ['No data.'],
      datasets: [{
        data: [1],
        backgroundColor: [],
        hoverBackgroundColor: []
      }]
    };

    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (osInterval) {
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
      url: '/information/summary/os',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: ""
      }
    }).then(
        (response) => {
          console.log(response);
          const detail = [];
          const labels = [];
          const data = [];
          const backgroundColor = [];
          const hoverBackgroundColor = [];
          response.data.map((bucket, index) => {
            if (bucket.count == 0) {
              return
            }
            const os_detail = {
              labels: [],
              datasets: [{
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: []
              }]
            };
            labels.push(bucket.name);
            data.push(bucket.count);
            const color = colorFamily[index % 15];
            backgroundColor.push(color);
            hoverBackgroundColor.push(color);

            bucket.detail.map((detail, i) => {
              os_detail.labels.push(detail.name);
              os_detail.datasets[0].data.push(detail.count);
              const detail_color = colorFamily[i % 15];
              os_detail.datasets[0].backgroundColor.push(detail_color);
              os_detail.datasets[0].hoverBackgroundColor.push(detail_color);
            });
            detail.push(os_detail);
          });
          if (data.length > 0) {
            doughnut_os.labels = labels;
            doughnut_os.datasets = [];
            doughnut_os.datasets.push(
                {
                  data: data,
                  backgroundColor: backgroundColor,
                  hoverBackgroundColor: hoverBackgroundColor
                }
            );
          }
          this.setState({osChartData: doughnut_os, osChartDetail: detail, osChartOption: this.doughnut_os_options});
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )

  }

  fetchInflow() {
    const {inflowInterval} = this.state;

    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (inflowInterval) {
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
      url: '/dashboard/inflow',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: "",
        exclude: 'pla-skin'
      }
    }).then(
        (response) => {
          //console.log(response);
          const inflowTotal = response.data.hits.total;
          //
          const inflowBuckets = response.data.aggregations.inflow_top.buckets;
          inflowBuckets.map((row, i) => {
            row.doc_ratio = inflowTotal == 0 ? 0 : (row.doc_count / inflowTotal * 100).toFixed(2);
          });
          //console.log(inflowBuckets);

          this.setState({
            inflowTopPage: inflowBuckets
          });
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  }

  renderInflowTopPage() {
    const {inflowTopPage} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

    if (inflowTopPage.length == 0) {
      return (
          <tr>
            <td colSpan={5} style={{textAlign: 'center'}}>No data.</td>
          </tr>
      )
    } else {
      return (
          inflowTopPage.map((row, i) =>
              <tr key={i}>
                <td>{i + 1}</td>
                <td title={row.key === "\"-\"" ? 'URL in browser' : row.key} style={tdStyle}>{row.key === "\"-\"" ? 'URL in bowser' : row.key}</td>
                <td>{row.doc_count}</td>
                <td>{row.doc_ratio}</td>
                <td><Progress className="progress-sm mt-2" color="danger" value={row.doc_ratio}/></td>
              </tr>
          )
      )
    }
  }

  onConversionBtnClick = (interval) => {
    this.setState({
      conversionInterval: interval,
    }, this.fetchConversion);
  };

  handleInflowIntervalChange = (interval) => {
    this.setState({inflowInterval: interval}, this.fetchInflow)
  };

  handleOSIntervalChange = (interval) => {
    this.setState({osInterval: interval}, this.fetchOS)
  };

  handleBrowserIntervalChange = (interval) => {
    this.setState({browserInterval: interval}, this.fetchBrowser)
  };

  render() {
    const {osChartData, osChartOption, inflowInterval, osInterval, browserInterval, browserChartData} = this.state;
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" sm="12" lg="12">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Traffic Sources</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleInflowIntervalChange(1)}
                                  active={inflowInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleInflowIntervalChange(2)}
                                  active={inflowInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleInflowIntervalChange(3)}
                                  active={inflowInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Table responsive style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col width="10%"/>
                      <col/>
                      <col width="10%"/>
                      <col width="10%"/>
                      <col width="20%"/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>No</th>
                      <th>Source</th>
                      <th>Count</th>
                      <th>Rate(%)</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderInflowTopPage()}
                    </tbody>
                  </Table>
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
                      <span className="mb-0"><strong>OS</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleOSIntervalChange(1)}
                                  active={osInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleOSIntervalChange(2)}
                                  active={osInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleOSIntervalChange(3)}
                                  active={osInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Doughnut data={osChartData} options={osChartOption}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardHeader style={{height: 46 + 'px'}}>
                  <Row>
                    <Col sm="5">
                      <span className="mb-0"><strong>Browser</strong></span>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleBrowserIntervalChange(1)}
                                  active={browserInterval === 1}>Day</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleBrowserIntervalChange(2)}
                                  active={browserInterval === 2}>Week</Button>
                          <Button size='sm' color="outline-secondary" onClick={() => this.handleBrowserIntervalChange(3)}
                                  active={browserInterval === 3}>Month</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-wrapper">
                    <Doughnut data={browserChartData}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <LocationOverview/>
          </Row>
        </div>
    );
  }
}

export default InformationSummary;
