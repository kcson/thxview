import React, {Component} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Row} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";

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

class OS extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: 1,
      osChartDetail: [],
      osChartOption: this.doughnut_os_options,
      osChartData: {
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

  timer = null;

  componentDidMount() {
    this.fetchData();

    this.timer = setInterval(() => {
      this.fetchData();
    }, 20 * 1000);

  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }

  fetchData() {
    const doughnut_os = {
      labels: ['No data.'],
      datasets: [{
        data: [1],
        backgroundColor: [],
        hoverBackgroundColor: []
      }]
    };

    const {interval} = this.state;
    const currentDate = new Date();
    let fromDate = null;
    let toDate = null;
    let format = null;

    switch (interval) {
      case 1: // 시간
        fromDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||-60m/m';
        toDate = moment(currentDate).format('YYYY-MM-DD HH:mm') + '||/m';
        format = 'yyyy-MM-dd HH:mm';
        break;
      case 2: //day
        fromDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        toDate = moment(currentDate).format('YYYY-MM-DD') + '||/d';
        format = 'yyyy-MM-dd';
        break;
    }

    axios({
      method: 'post',
      url: '/information/summary/os',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: format
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
            backgroundColor.push(color)
            hoverBackgroundColor.push(color)

            bucket.detail.map((detail, i) => {
              os_detail.labels.push(detail.name)
              os_detail.datasets[0].data.push(detail.count)
              const detail_color = colorFamily[i % 15];
              os_detail.datasets[0].backgroundColor.push(detail_color)
              os_detail.datasets[0].hoverBackgroundColor.push(detail_color)
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

  onIntervalBtnClick = (interval) => {
    this.setState({interval}, this.fetchData);
  };

  render() {
    const {interval, osChartData, osChartOption} = this.state;
    return (
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
                      <Button size='sm' color="outline-secondary" onClick={() => this.onIntervalBtnClick(1)}
                              active={interval === 1}>Hour</Button>
                      <Button size='sm' color="outline-secondary" onClick={() => this.onIntervalBtnClick(2)}
                              active={interval === 2}>Day</Button>
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
    );
  }
}

export default OS;
