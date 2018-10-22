import React, {Component} from 'react';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Row, Table} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";

class TopPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interval: 1,
      visitorTopPage: [],
      memberTopPage: []
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
      url: '/dashboard/toppage',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: format
      }
    }).then(
        (response) => {
          const visitorTotal = response.data.visitor_top.hits.total;
          const memberTotal = response.data.member_top.hits.total;

          const visitorBuckets = response.data.visitor_top.aggregations.visitor_top.buckets;
          visitorBuckets.map((row, i) => {
            row.doc_ratio = visitorTotal == 0 ? 0 : (row.doc_count / visitorTotal * 100).toFixed(2);
          });
          const memberBuckets = response.data.member_top.aggregations.member_top.buckets;
          memberBuckets.map((row, i) => {
            row.doc_ratio = memberTotal == 0 ? 0 : (row.doc_count / memberTotal * 100).toFixed(2);
          });

          this.setState({
            visitorTopPage: visitorBuckets,
            memberTopPage: memberBuckets
          });
        },
        (err) => {
          console.log(err);
        }
    )
  }

  onIntervalBtnClick = (interval) => {
    this.setState({interval}, this.fetchData);
  };

  renderVisitorTopPage() {
    const {visitorTopPage} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

    return (
        visitorTopPage.map((row, i) =>
            <tr key={i}>
              <td>{i + 1}</td>
              <td title={row.key} style={tdStyle}>{row.key}</td>
              <td>-</td>
              <td>{row.doc_count}({row.doc_ratio})</td>
            </tr>
        )
    )
  }

  renderMemberTopPage() {
    const {memberTopPage} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}

    return (
        memberTopPage.map((row, i) =>
            <tr key={i}>
              <td>{i + 1}</td>
              <td title={row.key} style={tdStyle}>{row.key}</td>
              <td>-</td>
              <td>{row.doc_count}({row.doc_ratio})</td>
            </tr>
        )
    )
  }

  render() {
    const {interval} = this.state;
    return (
        <Row>
          <Col xs="12" sm="12" lg="6">
            <Card>
              <CardHeader style={{height: 46 + 'px'}}>
                <Row>
                  <Col sm="5">
                    <span className="mb-0"><strong>Top Popular Pages - A Customer</strong></span>
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
                <Table responsive style={{tableLayout: 'fixed', marginBottom: 0}}>
                  <colgroup>
                    <col/>
                    <col width="40%"/>
                    <col width="30%"/>
                    <col/>
                  </colgroup>
                  <thead>
                  <tr>
                    <th>No</th>
                    <th>Page</th>
                    <th>Description</th>
                    <th>Count(%)</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.renderVisitorTopPage()}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" sm="12" lg="6">
            <Card>
              <CardHeader style={{height: 46 + 'px'}}>
                <Row>
                  <Col sm="5">
                    <span className="mb-0"><strong>Top Popular Pages - A Member</strong></span>
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
                <Table responsive style={{tableLayout: 'fixed', marginBottom: 0}}>
                  <colgroup>
                    <col/>
                    <col width="40%"/>
                    <col width="30%"/>
                    <col/>
                  </colgroup>
                  <thead>
                  <tr>
                    <th>No</th>
                    <th>Page</th>
                    <th>Description</th>
                    <th>Count(%)</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.renderMemberTopPage()}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
    );
  }
}

export default TopPage;
