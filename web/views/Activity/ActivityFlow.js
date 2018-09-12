import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Row} from 'reactstrap';
import 'moment-timezone';
import moment from 'moment';
import Chart from 'react-google-charts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default class ActivityFlow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: moment(new Date()),
      toDate: moment(new Date())
    }
  }

  componentDidMount() {
    //this.fetchData();
  }


  renderFlow() {
    const sankeyOptions = {
      sankey: {
        node: {
          width: 20,
          interactivity: true,
          label: {
            fontSize: 14
          }
        }
      }
    };

    const sankeyColumns = [
      {
        type: 'string',
        role: 'domain',
        label: 'From'
      },
      {
        type: 'string',
        role: 'domain',
        label: 'To'
      },
      {
        type: 'number',
        role: 'data',
        label: 'Weight'
      },
      {
        type: 'string',
        role: 'tooltip',
        label: null
      },

    ];

    return (
        <Chart
            width={'100%'}
            height={'300px'}
            chartType="Sankey"
            loader={<div>Loading Chart</div>}
            options={sankeyOptions}
            columns={sankeyColumns}
            rows={[
              ["www.facebook.com", "/login", 20, "login"],
              ["www.facebook.com", "/home", 10, "home"],
              ["www.google.com", "/login", 40, "login"],
              ["www.google.com", "/home", 30, "home"],
              ["/login", "/contact", 6, "Session Duration: 1 Minute(s), Bounce Rate: 30%"],
              ["/login", "/blog", 24, "Session Duration: 1 Minute(s), Bounce Rate: 30%"],
              ["/login", "/shop", 30, "Session Duration: 1 Minute(s), Bounce Rate: 30%"],
              ["/home", "/contact", 4, "Session Duration: 1 Minute(s), Bounce Rate: 50%"],
              ["/home", "/blog", 16, "Session Duration: 1 Minute(s), Bounce Rate: 50%"],
              ["/home", "/shop", 20, "Session Duration: 1 Minute(s), Bounce Rate: 50%"],
              ["/shop", "/plabeau", 4, "Session Duration: 1 Minute(s), Bounce Rate: 20%"],
              ["/shop", "/plaskin", 28, "Session Duration: 1 Minute(s), Bounce Rate: 20%"],
              ["/shop", "/plaskinplus", 8, "Session Duration: 1 Minute(s), Bounce Rate: 20%"],
              ["/blog", "/plaskin", 8, "Session Duration: 1 Minute(s), Bounce Rate: 80%"],
              ["/contact", "/plaskin", 1, "Session Duration: 1 Minute(s), Bounce Rate: 90%"],
              ["/plabeau", "/cart", 0.62, "Session Duration: 1 Minute(s), Bounce Rate: 80%"],
              ["/plaskin", "/cart", 10.9, "Session Duration: 2 Minute(s), Bounce Rate: 50%"],
              ["/plaskinplus", "/cart", 0.1, "Session Duration: 2 Minute(s), Bounce Rate: 100%"],
              ["/cart", "/purchase", 4.9, "Session Duration: 1 Minute(s), Bounce Rate: 20%"],
              //["B", "Y", 9, "tooltip"],
              //["B", "Z", 4, "tooltip"]
            ]}
            rootProps={{'data-testid': '1'}}
        />
    )
  }

  handleFromDateChange = (date) => {
    this.setState({fromDate: date})
  };

  handleToDateChange = (date) => {
    this.setState({toDate: date})
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
                    <Button type="submit" size="sm" color="primary"><i className="fa fa-dot-circle-o"></i>Search</Button>
                  </Form>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <strong>Activity Flow</strong>
                </CardHeader>
                <CardBody>
                  {this.renderFlow()}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
    );
  }
}