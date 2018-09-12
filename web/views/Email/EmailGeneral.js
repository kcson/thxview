import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, Col, Collapse, Input, Pagination, PaginationItem, PaginationLink, Row, Table} from 'reactstrap';
import axios from "axios";
import moment from 'moment';
import 'moment-timezone';
import * as HttpStatus from 'http-status-codes';

export default class EmailGeneral extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapse: [false, false, false, false, false, false, false, false, false, false],
      selected: '1',
      rows: [],
      activePage: 1,
      totalPage: 0,
      activeBlock: 1,
      totalBlock: 0
    }
  }

  PAGE_PER_BLOCK = 5;
  ROW_PER_PAGE = 10;

  componentDidMount() {
    console.log('componentDidMount : EmailGeneral')
    this.fetchData();
  }

  fetchData() {
    let fromDate = moment(new Date()).format('YYYY-MM-DD');
    let toDate = moment(new Date()).format('YYYY-MM-DD') + '||/d';
    if (this.state.selected === '1') {
      fromDate = fromDate + '||-1M/d';
    } else if (this.state.selected === '2') {
      fromDate = fromDate + '||-3M/d';
    } else if (this.state.selected === '3') {
      fromDate = fromDate + '||-6M/d';
    } else if (this.state.selected === '4') {
      fromDate = fromDate + '||-12M/d';
    } else {
      fromDate = fromDate + '||/d';
    }

    axios({
      method: 'post',
      url: '/email/general',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        from: (this.state.activePage - 1) * 10
      }
    }).then(
        (response) => {
          console.log(response);
          let totalPage = 0;
          if (response.data.hits.total > 0) {
            totalPage = Math.ceil(response.data.hits.total / this.ROW_PER_PAGE);
          }
          this.setState({totalPage});
          this.setState({totalBlock: Math.ceil(totalPage / this.PAGE_PER_BLOCK)});

          const results = [];
          response.data.hits.hits.map((row) => {
            const logDate = moment.tz(row._source['@timestamp'], moment.tz.guess());
            results.push(
                [
                  {
                    from: row._source.from,
                    subject: row._source.subject,
                    received: logDate.format('YYYY-MM-DD HH:mm'),
                  },
                  {
                    message: row._source.message
                  }
                ]
            );
          });
          this.setState({rows: results})
        },
        (err) => {
          console.log(err.response.status);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  }

  expandContent = (index) => {
    this.state.collapse[index] = !this.state.collapse[index];
    this.setState({collapse: this.state.collapse});
  };

  handleSelectChange = e => {
    this.setState({selected: e.target.value, activePage: 1, activeBlock: 1}, this.fetchData)
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

  handlePageChange = (page) => {
    this.setState({activePage: page}, this.fetchData)
  };

  renderActivePage() {
    if(this.state.totalPage === 0) {
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

  renderPage() {
    return (
        <Pagination style={{margin: '0 auto 0 auto', display: 'table'}}>
          {this.renderPrevPage()}
          {this.renderActivePage()}
          {this.renderNextPage()}
        </Pagination>
    )
  }

  renderTableBody() {
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}
    return this.state.rows.map((row, index) => {
      return row.map((r) => {
        if (r.message || r.message == "") {
          return (
              <tr style={{height: 0}}>
                <td colSpan='6' style={{padding: 0, border: 0}}>
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
                <td style={tdStyle}>General Filter</td>
                <td style={tdStyle} title={r.from}>{r.from}</td>
                <td style={tdStyle} title={r.subject}>{r.subject}</td>
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

  render() {
    const {selected} = this.state;
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" lg="12">
              <Card>
                <CardHeader>
                  <Input type="select" name="select" id="select" style={{display: 'inline'}} className='col-md-2' onChange={this.handleSelectChange}>
                    <option value="0" selected={selected === '0'}>Today</option>
                    <option value="1" selected={selected === '1'}>1 month</option>
                    <option value="2" selected={selected === '2'}>3 months</option>
                    <option value="3" selected={selected === '3'}>6 months</option>
                    <option value="4" selected={selected === '4'}>1 year</option>
                  </Input>
                  <Button className="btn btn-outline-primary" style={{float: 'right'}}><i
                      className="fa fa-file-excel-o"></i> Excel</Button>
                </CardHeader>
                <CardBody>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '9%'}}/>
                      <col/>
                      <col/>
                      <col style={{width: '11%'}}/>
                      <col style={{width: '7%'}}/>
                      <col style={{width: '6%'}}/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>Filter Name</th>
                      <th style={{verticalAlign: 'middle'}}>From</th>
                      <th style={{verticalAlign: 'middle'}}>Subject</th>
                      <th style={{verticalAlign: 'middle'}}>Received</th>
                      <th style={{verticalAlign: 'middle'}}>@</th>
                      <th style={{verticalAlign: 'middle'}}>Mail body</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderTableBody()}
                    </tbody>
                  </Table>
                  {this.renderPage()}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>

    );
  }
}