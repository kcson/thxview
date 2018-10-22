import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Row, Table} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default class Browser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: moment(new Date()),
      toDate: moment(new Date()),
      countryName: "",
      //countryCode: "",
      rows: [],
    }
  }

  countryCode = "";

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSite !== prevProps.selectedSite) {
      this.fetchData()
    }
  }


  fetchData = () => {
    const {fromDate, toDate, countryName} = this.state;
    axios({
      method: 'post',
      url: '/information/location',
      data: {
        fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
        toDate: toDate.format('YYYY-MM-DD') + '||/d',
        timeZone: moment.tz.guess(),
        countryName: countryName,
        countryCode: this.countryCode
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
    const {rows} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 5 + 'px', paddingBottom: 5 + 'px'};
    if (rows.length == 0) {
      return (
          <tr>
            <td colSpan={7} style={{textAlign: 'center'}}>No data.</td>
          </tr>
      )
    } else {
      if (this.countryCode === "") {
        return (
            rows.map((row, index) => {
                  const flag = "flag-icon flag-icon-" + row.country_code;
                  return (
                      <tr>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle} title={row.name}>
                          <a href='#' data-country-code={row.country_code} onClick={this.handleCountryClick}>
                            <i className={flag} title="ad" id="ad" style={{marginRight: 3 + 'px'}}></i>
                            {row.name}
                          </a>
                        </td>
                        <td style={tdStyle}>{row.new_user} ({(row.new_user / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.user} ({(row.user / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.customer} ({(row.customer / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.member} ({(row.member / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.page_view}</td>
                      </tr>
                  )
                }
            )
        )
      } else {
        return (
            rows.map((row, index) => {
                  return (
                      <tr>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle} title={row.name}>{row.name}</td>
                        <td style={tdStyle}>{row.new_user} ({(row.new_user / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.user} ({(row.user / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.customer} ({(row.customer / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.member} ({(row.member / row.page_view * 100).toFixed(2)})</td>
                        <td style={tdStyle}>{row.page_view}</td>
                      </tr>
                  )
                }
            )
        )
      }
    }
  }

  handleCountryClick = (event) => {
    event.preventDefault();
    this.countryCode = event.target.getAttribute('data-country-code');
    this.fetchData();
  };

  handleSearchClick = () => {
    this.countryCode = "";
    this.fetchData();
  };

  handleFromDateChange = (date) => {
    this.setState({fromDate: date})
  };

  handleToDateChange = (date) => {
    this.setState({toDate: date})
  };

  handleCountryNameChange = (event) => {
    this.setState({countryName: event.target.value})
  };

  render() {
    const {fromDate, toDate} = this.state;
    let title = "Country";
    if (this.countryCode !== "") {
      title = "State/City";
    }
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
                      <Label htmlFor="exampleInputEmail2" className="pr-1">Locations</Label>
                      <Input type="text" placeholder="United States" onChange={this.handleCountryNameChange}/>
                    </FormGroup>
                    <Button size="sm" color="primary" onClick={this.handleSearchClick}><i className="fa fa-dot-circle-o"></i>Search</Button>
                  </Form>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <strong>Locations</strong>
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
                      <th style={{verticalAlign: 'middle', padding: 6 + 'px', textAlign: 'center'}} rowSpan={2}>{title}</th>
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