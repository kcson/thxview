import React, {Component} from 'react';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Row} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";
import GoogleMap from 'google-map-react';
import MapPalce from "../Map/MapPalce";

class ActiveLocation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      center: {
        lat: 36.8929,
        lng: -76.1468
      },
      zoom: 1,
      interval: 1,
      locations: []
    };
  }

  locationTimer = null;

  componentDidMount() {
    this.fetchData();

    this.locationTimer = setInterval(() => {
      this.fetchData();
    }, 20 * 1000);

  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
    if (this.locationTimer !== null) {
      clearInterval(this.browserTimer);
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
      url: '/dashboard/location',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: format
      }
    }).then(
        (response) => {
          console.log(response);
          if (response.data.locations === null) {
            this.setState({locations: [], center: {lat: 36.8929, lng: -76.1468}});
            return;
          }
          let center = response.data.center;
          this.setState({locations: response.data.locations, center: {lat: center.lat, lng: center.lon}})
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

  renderPlace() {
    const {locations} = this.state;

    return (
        locations.map((l) =>
            <MapPalce lat={l.latitude} lng={l.longitude} text={l.count}/>
        )
    )
  }

  render() {
    const {interval, center} = this.state;
    return (
        <Col xs="12" sm="12" lg="12">
          <Card>
            <CardHeader style={{height: 46 + 'px'}}>
              <Row>
                <Col sm="5">
                  <span className="mb-0"><strong>Active Locations</strong></span>
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
              <div style={{height: '80vh', width: '100%'}}>
                <GoogleMap
                    apiKey='AIzaSyDEage5EGQCxIHPR6Qdf9qkMPctSTopO8Y'
                    center={{lat: center.lat, lng: center.lng}}
                    zoom={1}
                    options={{minZoom: 2, maxZoom: 8}}
                >
                  {this.renderPlace()}
                </GoogleMap>
              </div>
            </CardBody>
          </Card>
        </Col>
    );
  }
}

export default ActiveLocation;
