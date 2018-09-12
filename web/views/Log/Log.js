import React, {PureComponent} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Table
} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import axios from "axios";
import DatePicker from 'react-datepicker'
import * as HttpStatus from "http-status-codes/index";

import 'react-datepicker/dist/react-datepicker.css';

export default class Log extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: moment(new Date()),
      toDate: moment(new Date()),
      searchAfterDate: 0,
      searchAfterId: "",
      searchBeforeDate: 0,
      searchBeforeId: "",
      rows: [],
      activePage: 0,
      totalPage: 0,
      activeBlock: 1,
      totalBlock: 0,
      ascending: false
    }
  }

  PAGE_PER_BLOCK = 5;
  ROW_PER_PAGE = 10;
  activePage = 1;
  searchClicked = false;

  componentDidMount() {
    this.fetchData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.fromDate !== nextState.fromDate) {
      return true;
    }
    if (this.state.toDate !== nextState.toDate) {
      return true;
    }
    if (this.searchClicked) {
      this.searchClicked = false;
      return true;
    }

    if (this.state.activePage === nextState.activePage) {
      return false;
    }
    return true;
  }

  fetchData() {
    const {fromDate, toDate, searchAfterDate, searchAfterId, searchBeforeDate, searchBeforeId, ascending} = this.state;
    let cursorDate = 0;
    let cursorId = "";
    let beforeDate = 0;
    let beforeId = "";
    let afterDate = 0;
    let afterId = "";

    if (ascending) {
      cursorDate = searchBeforeDate;
      cursorId = searchBeforeId;
    } else {
      cursorDate = searchAfterDate;
      cursorId = searchAfterId;
    }

    axios({
      method: 'post',
      url: '/log/search',
      data: {
        fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
        toDate: toDate.format('YYYY-MM-DD') + '||/d',
        searchAfterDate: cursorDate,
        searchAfterId: cursorId,
        timeZone: moment.tz.guess(),
        ascending: ascending
      }
    }).then(
        (response) => {
          console.log(response);
          let totalPage = Math.ceil(response.data.hits.total / this.ROW_PER_PAGE);
          let totalBlock = Math.ceil(totalPage / this.PAGE_PER_BLOCK);
          const dataRows = [];

          response.data.hits.hits.map((row) => {
            const logDate = moment.tz(row._source['@timestamp'], moment.tz.guess());
            dataRows.push({
              accessDate: logDate.format('YYYY-MM-DD HH:mm:ss'),
              ip: row._source.clientip,
              page: row._source.request,
              location: row._source.geoip.country_name + '(' + row._source.geoip.city_name + ')',
              os: row._source.os,
              browser: row._source.name,
              userType: row._source.member_yn === 0 ? "A Customer" : "A Member",
              purchase: row._source.purchase_yn === 0 ? "N" : "Y",
              inflow: row._source.referrer
            });
          });

          if (response.data.hits.total > 0) {
            if (ascending) {
              beforeDate = response.data.hits.hits[response.data.hits.hits.length - 1].sort[0];
              beforeId = response.data.hits.hits[response.data.hits.hits.length - 1].sort[1];
              afterDate = response.data.hits.hits[0].sort[0];
              afterId = response.data.hits.hits[0].sort[1];
            } else {
              beforeDate = response.data.hits.hits[0].sort[0];
              beforeId = response.data.hits.hits[0].sort[1];
              afterDate = response.data.hits.hits[response.data.hits.hits.length - 1].sort[0];
              afterId = response.data.hits.hits[response.data.hits.hits.length - 1].sort[1];
            }
            this.setState({
              searchBeforeDate: beforeDate,
              searchBeforeId: beforeId,
              searchAfterDate: afterDate,
              searchAfterId: afterId,
              activePage: this.activePage,
              totalPage,
              totalBlock,
              rows: dataRows
            });
          } else {
            this.setState({
              totalPage,
              totalBlock,
              rows: dataRows
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
  }

  renderContent() {
    const {rows, ascending, activePage} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 5 + 'px', paddingBottom: 5 + 'px'};
    if (rows.length === 0) {
      return (
          <tr>
            <td colSpan={9} style={{textAlign: 'center', border: 1 + 'px'}}>No data.</td>
          </tr>
      )
    } else {
      const currentRows = [];
      let indexPage = (activePage % this.PAGE_PER_BLOCK === 0) ? this.PAGE_PER_BLOCK : activePage % this.PAGE_PER_BLOCK;
      let startIndex = 0;
      let endIndex = 0;
      if (ascending) {
        startIndex = (5 - indexPage) * this.ROW_PER_PAGE;
        endIndex = startIndex + this.ROW_PER_PAGE;

        let currentIndex = 0;
        for (let i = endIndex - 1; i >= startIndex; i--) {
          currentRows[currentIndex++] = rows[i];
        }
      } else {
        startIndex = (indexPage - 1) * this.ROW_PER_PAGE;
        endIndex = startIndex + this.ROW_PER_PAGE;

        let currentIndex = 0;
        for (let i = startIndex; i < endIndex; i++) {
          if (rows[i]) {
            currentRows[currentIndex++] = rows[i];
          }
        }
      }

      console.log(currentRows);
      return currentRows.map((row) =>
          <tr>
            <td style={tdStyle}>{row.accessDate}</td>
            <td style={tdStyle}>{row.ip}</td>
            <td style={tdStyle} title={row.page}>{row.page}</td>
            <td style={tdStyle} title={row.location}>{row.location}</td>
            <td style={tdStyle}>{row.os}</td>
            <td style={tdStyle} title={row.browser}>{row.browser}</td>
            <td style={tdStyle}>{row.userType}</td>
            <td style={tdStyle}>{row.purchase}</td>
            <td style={tdStyle} title={row.inflow}>{row.inflow}</td>
          </tr>
      )
    }

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

  handlePrevBokck = () => {
    let minPage = 1 + (this.state.activeBlock - 1) * 5;
    this.activePage = minPage - 1;
    this.setState({activeBlock: this.state.activeBlock - 1, ascending: true}, this.fetchData)
  };

  handleNextBokck = () => {
    let maxPage = 5 + (this.state.activeBlock - 1) * 5;
    this.activePage = maxPage + 1;
    this.setState({activeBlock: this.state.activeBlock + 1, ascending: false}, this.fetchData)
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
    this.setState({activePage: page})
  };

  handleFromDateChange = (date) => {
    this.setState({fromDate: date})
  };

  handleToDateChange = (date) => {
    this.setState({toDate: date})
  };

  handleSearchClick = () => {
    this.setState({
      searchAfterDate: 0,
      searchAfterId: "",
      searchBeforeDate: 0,
      searchBeforeId: "",
      //activePage: 1,
      //totalPage: 0,
      activeBlock: 1,
      totalBlock: 0,
      ascending: false
    }, () => {
      this.searchClicked = true;
      this.activePage = 1;
      this.fetchData();
    });
  };

  render() {
    const {fromDate, toDate} = this.state;

    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" lg="12">
              <Card style={{marginBottom: 15 + 'px'}}>
                <CardHeader>
                  <Form inline>
                    <FormGroup className="pr-1">
                      <Label htmlFor="exampleInputName2" className="pr-1">Period</Label>
                      <DatePicker className="form-control" selected={fromDate} onChange={this.handleFromDateChange} dateFormat="YYYY-MM-DD"/>
                      ~
                      <DatePicker className="form-control" selected={toDate} onChange={this.handleToDateChange} dateFormat="YYYY-MM-DD"/>
                    </FormGroup>
                    <FormGroup className="pr-1">
                      <Label htmlFor="exampleInputEmail2" className="pr-1">Page</Label>
                      <Input type="text" id="exampleInputEmail2" placeholder="www.example.com"/>
                    </FormGroup>
                    <FormGroup className="pr-1">
                      <Label htmlFor="exampleInputEmail2" className="pr-1">Source</Label>
                      <Input type="text" id="exampleInputEmail2" placeholder="www.google.com"/>
                    </FormGroup>
                    <FormGroup className="pr-1">
                      <Label htmlFor="ccmonth" className="pr-1">OS</Label>
                      <Input type="select" name="ccmonth" id="ccmonth">
                        <option value="0">-</option>
                        <option value="1">Windows</option>
                        <option value="2">Mac</option>
                        <option value="3">Linux</option>
                        <option value="4">iOS</option>
                        <option value="5">Android</option>
                      </Input>
                    </FormGroup>
                    <Button size="sm" color="primary" onClick={this.handleSearchClick}><i className="fa fa-dot-circle-o"></i>Search</Button>
                  </Form>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <strong>Access Log</strong>
                </CardHeader>
                <CardBody>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '13%'}}/>
                      <col style={{width: '11%'}}/>
                      <col/>
                      <col style={{width: '12%'}}/>
                      <col style={{width: '9%'}}/>
                      <col style={{width: '8%'}}/>
                      <col style={{width: '9%'}}/>
                      <col style={{width: '8%'}}/>
                      <col/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>Date & Time</th>
                      <th style={{verticalAlign: 'middle'}}>IP</th>
                      <th style={{verticalAlign: 'middle'}}>Page</th>
                      <th style={{verticalAlign: 'middle'}}>Locations</th>
                      <th style={{verticalAlign: 'middle'}}>OS</th>
                      <th style={{verticalAlign: 'middle'}}>Browser</th>
                      <th style={{verticalAlign: 'middle'}}>User</th>
                      <th style={{verticalAlign: 'middle'}}>Purchase</th>
                      <th style={{verticalAlign: 'middle'}}>Source</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderContent()}
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