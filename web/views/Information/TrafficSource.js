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

export default class TrafficSource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: moment(new Date()),
      toDate: moment(new Date()),
      path: "",
      rows: [],
      activePage: 1,
      totalPage: 0,
      activeBlock: 1,
      totalBlock: 0,
      //received: moment(new Date()).format('YYYY-MM-DD')
    }
  }

  PAGE_PER_BLOCK = 5;
  ROW_PER_PAGE = 10;

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const {fromDate, toDate, path} = this.state;
    axios({
      method: 'post',
      url: '/information/traffic_source',
      data: {
        fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
        toDate: toDate.format('YYYY-MM-DD') + '||/d',
        timeZone: moment.tz.guess(),
        path: path,
        exclude: 'pla-skin'
      }
    }).then(
        (response) => {
          console.log(response);
          if (response.data == null) {
            this.setState({rows: []});
            return;
          }
          this.setState({rows: response.data});
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  };

  renderContent() {
    const {rows} = this.state
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 5 + 'px', paddingBottom: 5 + 'px'};
    if (rows.length == 0) {
      return (
          <tr>
            <td colSpan={7} style={{textAlign: 'center'}}>No data.</td>
          </tr>
      )
    } else {
      return (
          rows.map((row, index) =>
              <tr>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle} title={row.name === '-'?'URL in bowser':row.name}>{row.name === '-'?'URL in bowser':row.name}</td>
                <td style={tdStyle}>{row.new_user} ({(row.new_user/row.page_view*100).toFixed(2)})</td>
                <td style={tdStyle}>{row.user} ({(row.user/row.page_view*100).toFixed(2)})</td>
                <td style={tdStyle}>{row.customer} ({(row.customer/row.page_view*100).toFixed(2)})</td>
                <td style={tdStyle}>{row.member} ({(row.member/row.page_view*100).toFixed(2)})</td>
                <td style={tdStyle}>{row.page_view}</td>
              </tr>
          )
      )
    }
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

  handlePathChange = (event) => {
    this.setState({path: event.target.value})
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
                    <FormGroup className="pr-1">
                      <Label htmlFor="exampleInputEmail2" className="pr-1">Path</Label>
                      <Input type="text" placeholder="www.example.com" onChange={this.handlePathChange}/>
                    </FormGroup>
                    <Button size="sm" color="primary" onClick={this.fetchData}><i className="fa fa-dot-circle-o"></i>Search</Button>
                  </Form>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <strong>Traffic Sources</strong>
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
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} rowSpan={2}>Source</th>
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
                    <tbody>
                    {this.renderContent()}
                    </tbody>
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