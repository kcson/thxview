import React, {Component} from 'react';
import {Doughnut, Line} from 'react-chartjs-2';
import {
  Button,
  ButtonDropdown,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Table,
} from 'reactstrap';
import moment from 'moment'
import {ComposableMap, Geographies, Geography, Marker, Markers, ZoomableGroup} from "react-simple-maps";
import axios from "axios";
import {scaleLinear} from "d3-scale";

//map
const wrapperStyles = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
};

const cityScale = scaleLinear()
    .domain([0, 37843000])
    .range([1, 25]);

const brandPrimary = '#20a8d8';
const brandSuccess = '#4dbd74';
const brandInfo = '#63c2de';
const brandWarning = '#f8cb00';
const brandDanger = '#f86c6b';

// Card Chart 1
const cardChartData1 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: brandPrimary,
      borderColor: 'rgba(255,255,255,.55)',
      data: [65, 59, 84, 84, 51, 55, 40],
    },
  ],
};

const cardChartOpts1 = {
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
          min: Math.min.apply(Math, cardChartData1.datasets[0].data) - 5,
          max: Math.max.apply(Math, cardChartData1.datasets[0].data) + 5,
        },
      }],
  },
  elements: {
    line: {
      borderWidth: 1,
    },
    point: {
      radius: 4,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};

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

// Card Chart 3
const cardChartData3 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      data: [78, 81, 80, 45, 34, 12, 40],
    },
  ],
};

const cardChartOpts3 = {
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};

// Card Chart 4
const cardChartData4 = {
  labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,255,255,.3)',
      borderColor: 'transparent',
      data: [78, 81, 80, 45, 34, 12, 40, 75, 34, 89, 32, 68, 54, 72, 18, 98],
    },
  ],
};

const cardChartOpts4 = {
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
        barPercentage: 0.6,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
};

// Social Box Chart
const socialBoxData = [
  {data: [65, 59, 84, 84, 51, 55, 40], label: 'facebook'},
  {data: [1, 13, 9, 17, 34, 41, 38], label: 'twitter'},
  {data: [78, 81, 80, 45, 34, 12, 40], label: 'linkedin'},
  {data: [35, 23, 56, 22, 97, 23, 64], label: 'google'},
];

const makeSocialBoxData = (dataSetNo) => {
  const dataset = socialBoxData[dataSetNo];
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        backgroundColor: 'rgba(255,255,255,.1)',
        borderColor: 'rgba(255,255,255,.55)',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
        data: dataset.data,
        label: dataset.label,
      },
    ],
  };
  return () => data;
};

const socialChartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
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

// sparkline charts
const sparkLineChartData = [
  {
    data: [35, 23, 56, 22, 97, 23, 64],
    label: 'New Clients',
  },
  {
    data: [65, 59, 84, 84, 51, 55, 40],
    label: 'Recurring Clients',
  },
  {
    data: [35, 23, 56, 22, 97, 23, 64],
    label: 'Pageviews',
  },
  {
    data: [65, 59, 84, 84, 51, 55, 40],
    label: 'Organic',
  },
  {
    data: [78, 81, 80, 45, 34, 12, 40],
    label: 'CTR',
  },
  {
    data: [1, 13, 9, 17, 34, 41, 38],
    label: 'Bounce Rate',
  },
];

const makeSparkLineData = (dataSetNo, variant) => {
  const dataset = sparkLineChartData[dataSetNo];
  const data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        backgroundColor: 'transparent',
        borderColor: variant ? variant : '#c2cfd6',
        data: dataset.data,
        label: dataset.label,
      },
    ],
  };
  return () => data;
};

const sparklineChartOpts = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    xAxes: [
      {
        display: false,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
  legend: {
    display: false,
  },
};

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

var elements = 24;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50, 200));
  data2.push(random(80, 100));
  data3.push(65);
}

const webMainChart = {
  labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: convertHex(brandInfo, 10),
      borderColor: brandInfo,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data1,
    },
    {
      label: 'My Second dataset',
      backgroundColor: 'transparent',
      borderColor: brandSuccess,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data2,
    },
    {
      label: 'My Third dataset',
      backgroundColor: 'transparent',
      borderColor: brandDanger,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 1,
      borderDash: [8, 5],
      data: data3,
    },
  ],
};

const doughnut = {
  labels: [
    'Windows',
    'Mac',
    'Mobile',
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

const mainChartOpts = {
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
          stepSize: Math.ceil(250 / 5),
          max: 250,
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

class WebTraffic extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      toDay: moment(new Date()).format('YYYY-MM-DD'),
      cities: []
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  componentDidMount() {
    this.fetchMapData();
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

  render() {

    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" sm="4" lg="4">
              <Card className="text-white bg-info">
                <CardBody className="pb-0">
                  <ButtonGroup className="float-right">
                    <ButtonDropdown id='card1' isOpen={this.state.card1} toggle={() => {
                      this.setState({card1: !this.state.card1});
                    }}>
                      <DropdownToggle caret className="p-0" color="transparent">
                        <i className="icon-settings"></i>
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem>Action</DropdownItem>
                        <DropdownItem>Another action</DropdownItem>
                        <DropdownItem disabled>Disabled action</DropdownItem>
                        <DropdownItem>Something else here</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </ButtonGroup>
                  <h4 className="mb-0">9,823</h4>
                  <p>오늘 방문한 사용자</p>
                </CardBody>
                <div className="chart-wrapper px-3" style={{height: '70px'}}>
                  <Line data={cardChartData2} options={cardChartOpts2} height={70}/>
                </div>
              </Card>
            </Col>

            <Col xs="12" sm="4" lg="4">
              <Card className="text-white bg-primary">
                <CardBody className="pb-0">
                  <ButtonGroup className="float-right">
                    <Dropdown id='card2' isOpen={this.state.card2} toggle={() => {
                      this.setState({card2: !this.state.card2});
                    }}>
                      <DropdownToggle className="p-0" color="transparent">
                        <i className="icon-location-pin"></i>
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem>Action</DropdownItem>
                        <DropdownItem>Another action</DropdownItem>
                        <DropdownItem>Something else here</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                  <h4 className="mb-0">1,822</h4>
                  <p>오늘 처음 방문한 사용자</p>
                </CardBody>
                <div className="chart-wrapper px-3" style={{height: '70px'}}>
                  <Line data={cardChartData1} options={cardChartOpts1} height={70}/>
                </div>
              </Card>
            </Col>

            <Col xs="12" sm="4" lg="4">
              <Card className="text-white bg-warning">
                <CardBody className="pb-0">
                  <ButtonGroup className="float-right">
                    <Dropdown id='card3' isOpen={this.state.card3} toggle={() => {
                      this.setState({card3: !this.state.card3});
                    }}>
                      <DropdownToggle caret className="p-0" color="transparent">
                        <i className="icon-settings"></i>
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem>Action</DropdownItem>
                        <DropdownItem>Another action</DropdownItem>
                        <DropdownItem>Something else here</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </ButtonGroup>
                  <h4 className="mb-0">8,001</h4>
                  <p>오늘 재 방문한 사용자</p>
                </CardBody>
                <div className="chart-wrapper px-0" style={{height: '70px'}}>
                  <Line data={cardChartData3} options={cardChartOpts3} height={70}/>
                </div>
              </Card>
            </Col>
            {/*
          <Col xs="12" sm="6" lg="3">
            <Card className="text-white bg-danger">
              <CardBody className="pb-0">
                <ButtonGroup className="float-right">
                  <ButtonDropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                    <DropdownToggle caret className="p-0" color="transparent">
                      <i className="icon-settings"></i>
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem>Action</DropdownItem>
                      <DropdownItem>Another action</DropdownItem>
                      <DropdownItem>Something else here</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </ButtonGroup>
                <h4 className="mb-0">9.823</h4>
                <p>Members online</p>
              </CardBody>
              <div className="chart-wrapper px-3" style={{ height: '70px' }}>
                <Bar data={cardChartData4} options={cardChartOpts4} height={70} />
              </div>
            </Card>
          </Col>
          */}
          </Row>

          <Row>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="5" lg="6">
                      <CardTitle className="mb-0">방문자가 가장 많이 본 페이지</CardTitle>
                      <div className="small text-muted">{this.state.toDay}</div>
                    </Col>
                    <Col sm="7" lg="6" className="d-none d-sm-inline-block">
                      <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                  active={this.state.radioSelected === 1}>Day</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                  active={this.state.radioSelected === 2}>Month</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)}
                                  active={this.state.radioSelected === 3}>Year</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
                    <Table responsive>
                      <thead>
                      <tr>
                        <th>순위</th>
                        <th>Page</th>
                        <th>View</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                        <td>1</td>
                        <td>/search</td>
                        <td>250</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>/promotion</td>
                        <td>210</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>/login</td>
                        <td>200</td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>/content/view</td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>/bestsellers</td>
                        <td>75</td>
                      </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="5">
                      <CardTitle className="mb-0">Traffic</CardTitle>
                      <div className="small text-muted">{this.state.toDay}</div>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                  active={this.state.radioSelected === 1}>Day</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                  active={this.state.radioSelected === 2}>Month</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)}
                                  active={this.state.radioSelected === 3}>Year</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
                    <Line data={webMainChart} options={mainChartOpts} height={300}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="5">
                      <CardTitle className="mb-0">방문한 사용자 추이</CardTitle>
                      <div className="small text-muted">{this.state.toDay}</div>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                  active={this.state.radioSelected === 1}>Day</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                  active={this.state.radioSelected === 2}>Month</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)}
                                  active={this.state.radioSelected === 3}>Year</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
                    <Line data={webMainChart} options={mainChartOpts} height={300}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="5">
                      <CardTitle className="mb-0">처음 방문한 사용자 추이</CardTitle>
                      <div className="small text-muted">{this.state.toDay}</div>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                  active={this.state.radioSelected === 1}>Day</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                  active={this.state.radioSelected === 2}>Month</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)}
                                  active={this.state.radioSelected === 3}>Year</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
                    <Line data={webMainChart} options={mainChartOpts} height={300}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="5">
                      <CardTitle className="mb-0">방문자 OS</CardTitle>
                      <div className="small text-muted">{this.state.toDay}</div>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                  active={this.state.radioSelected === 1}>Day</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                  active={this.state.radioSelected === 2}>Month</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)}
                                  active={this.state.radioSelected === 3}>Year</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <div className="chart-wrapper" style={{marginTop: 20 + 'px'}}>
                    <Doughnut data={doughnut}/>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" sm="12" lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm="5">
                      <CardTitle className="mb-0">방문자 위치</CardTitle>
                      <div className="small text-muted">{this.state.toDay}</div>
                    </Col>
                    <Col sm="7" className="d-none d-sm-inline-block">
                      <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
                      <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                        <ButtonGroup className="mr-3" aria-label="First group">
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                                  active={this.state.radioSelected === 1}>Day</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                                  active={this.state.radioSelected === 2}>Month</Button>
                          <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)}
                                  active={this.state.radioSelected === 3}>Year</Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <div className="chart-wrapper" style={{marginTop: 20 + 'px'}}>
                    <ComposableMap
                        projectionConfig={{scale: 205}}
                        width={980}
                        height={551}
                        style={{
                          width: "100%",
                          height: "auto",
                        }}
                    >
                      <ZoomableGroup center={[0, 20]} disablePanning>
                        <Geographies geography="/public/static/world-50m.json">
                          {(geographies, projection) =>
                              geographies.map((geography, i) =>
                                  geography.id !== "ATA" && (
                                      <Geography
                                          key={i}
                                          geography={geography}
                                          projection={projection}
                                          style={{
                                            default: {
                                              fill: "#ECEFF1",
                                              stroke: "#607D8B",
                                              strokeWidth: 0.75,
                                              outline: "none",
                                            },
                                            hover: {
                                              fill: "#ECEFF1",
                                              stroke: "#607D8B",
                                              strokeWidth: 0.75,
                                              outline: "none",
                                            },
                                            pressed: {
                                              fill: "#ECEFF1",
                                              stroke: "#607D8B",
                                              strokeWidth: 0.75,
                                              outline: "none",
                                            },
                                          }}
                                      />
                                  ))}
                        </Geographies>
                        <Markers>
                          {
                            this.state.cities.map((city, i) => (
                                <Marker key={i} marker={city}>
                                  <circle
                                      cx={0}
                                      cy={0}
                                      r={cityScale(city.population)}
                                      fill="rgba(255,87,34,0.8)"
                                      stroke="#607D8B"
                                      strokeWidth="2"
                                  />
                                </Marker>
                            ))
                          }
                        </Markers>
                      </ZoomableGroup>
                    </ComposableMap>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
    );
  }
}

export default WebTraffic;
