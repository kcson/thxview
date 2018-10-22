import React, {Component} from 'react';
import {Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardHeader, Col, Row} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";
import GoogleMap from 'google-map-react';
import MapPalce from "../Map/MapPalce";

class LocationOverview extends Component {
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

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSite !== prevProps.selectedSite) {
      this.fetchData()
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log(this.state.interval + ' : ' + nextState.interval);
  //   return this.state.interval !== nextState.interval;
  // }

  fetchData() {
    const {interval} = this.state;
    let toDay = moment(new Date()).format('YYYY-MM-DD');
    let fromDate = null;
    let toDate = toDay + '||/d';

    switch (interval) {
      case 1:
        fromDate = toDay + '||/d';
        break;
      case 2:
        fromDate = toDay + '||-7d/d';
        break;
      case 3:
        fromDate = toDay + '||-1M/d';
        break;
    }

    axios({
      method: 'post',
      url: '/dashboard/location',
      data: {
        fromDate: fromDate,
        toDate: toDate,
        timeZone: moment.tz.guess(),
        format: 'yyyy-MM-dd'
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
        locations.map((l) => {
              return <MapPalce lat={l.latitude} lng={l.longitude} text={l.count}/>
            }
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
                              active={interval === 1}>Day</Button>
                      <Button size='sm' color="outline-secondary" onClick={() => this.onIntervalBtnClick(2)}
                              active={interval === 2}>Week</Button>
                      <Button size='sm' color="outline-secondary" onClick={() => this.onIntervalBtnClick(3)}
                              active={interval === 3}>Month</Button>
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

export default LocationOverview;
