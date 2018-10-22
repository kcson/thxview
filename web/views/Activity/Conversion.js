import React, {Component} from 'react';
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
import * as HttpStatus from "http-status-codes/index";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default class Conversion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: moment(new Date()),
      toDate: moment(new Date()),
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
    //this.fetchData();
  }

  componentDidUpdate(prevProps) {

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

  renderContent() {
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 5 + 'px', paddingBottom: 5 + 'px'};

    return (
        <tbody>
        <tr>
          <td style={tdStyle}>1</td>
          <td style={tdStyle}>Purchases</td>
          <td style={tdStyle}>15(10)</td>
          <td style={tdStyle}>15(10)</td>
          <td style={tdStyle}>15(10)</td>
          <td style={tdStyle}>15(10)</td>
          <td style={tdStyle}>30</td>
        </tr>
        <tr>
          <td style={tdStyle}>2</td>
          <td style={tdStyle}>Registrations</td>
          <td style={tdStyle}>12(8)</td>
          <td style={tdStyle}>12(8)</td>
          <td style={tdStyle}>12(8)</td>
          <td style={tdStyle}>-</td>
          <td style={tdStyle}>30</td>
        </tr>
        </tbody>
    )
  }

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

  handleFromDateChange = (date) => {
    this.setState({fromDate: date})
  };

  handleToDateChange = (date) => {
    this.setState({toDate: date})
  };

  renderPage() {
    return (
        <Pagination>
          <PaginationItem><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
          <PaginationItem active>
            <PaginationLink tag="button">1</PaginationLink>
          </PaginationItem>
          <PaginationItem className="page-item"><PaginationLink tag="button">2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
        </Pagination>
    )
    /*
    return (
        <Pagination style={{margin: '0 auto 0 auto', display: 'table'}}>
          {this.renderPrevPage()}
          {this.renderActivePage()}
          {this.renderNextPage()}
        </Pagination>
    )
    */
  }

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
                    <Button type="submit" size="sm" color="primary"><i className="fa fa-dot-circle-o"></i>Search</Button>
                  </Form>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <strong>Conversions</strong>
                </CardHeader>
                <CardBody>
                  <Table striped bordered style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '5%'}}/>
                      <col style={{width: '25%'}}/>
                      <col/>
                      <col/>
                      <col/>
                      <col/>
                      <col/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} rowSpan={2}>No</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} rowSpan={2}>Goal</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} colSpan={2}>Type/Visit</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} colSpan={2}>Type/User</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} rowSpan={2}>Page Views</th>
                    </tr>
                    <tr>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}}>New Users(%)</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}}>Users(%)</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}}>A Customer(%)</th>
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}}>A Member(%)</th>
                    </tr>
                    </thead>
                    {this.renderContent()}
                  </Table>
                  {/*this.renderPage()*/}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
    );
  }
}