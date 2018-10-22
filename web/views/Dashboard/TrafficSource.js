import React, {Component} from 'react';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Progress, Row, Table} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";

class TrafficSource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: 1,
      inflowTopPage: []
    };
  }

  timer = null;

  componentDidMount() {
    this.fetchData();

    this.timer = setInterval(() => {
      this.fetchData();
    }, 20 * 1000);

  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSite !== prevProps.selectedSite) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }

  fetchData() {
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
      url: '/dashboard/inflow',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: format,
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

          this.setState({
            inflowTopPage: inflowBuckets
          });
        },
        (err) => {
          console.log(err);
        }
    )
  }

  renderInflowTopPage() {
    const {inflowTopPage} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

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

  onIntervalBtnClick = (interval) => {
    this.setState({interval}, this.fetchData);
  };

  render() {
    const {interval} = this.state;
    return (
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
    );
  }
}

export default TrafficSource;
