import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table
} from 'reactstrap';

export default class EmailFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      filterType: "Maritime"
    }
  }

  popupModel = () => {
    this.setState({modal: !this.state.modal});
  };

  handleFilterTypeChange = (type) => {
    this.setState({filterType: type})
  };

  renderFilterOption = () => {
    if (this.state.filterType === 'Maritime') {
      return this.renderMaritime();
    } else {
      return this.renderGeneral();
    }
  };

  renderMaritime = () =>
      (
          <Card style={{border: 0}}>
            <CardBody style={{padding: 0}}>
              <ListGroup>
                <ListGroupItem>
                  <Form inline={true}>
                    <FormGroup className="pr-1">
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>Open Area</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Open Area"
                             style={{marginRight: 10, width: 180 + 'px'}} required/>
                    </FormGroup>
                    <FormGroup className="pr-1">
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>DWT</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="DWT" style={{marginRight: 10, width: 180 + 'px'}} required/>
                    </FormGroup>
                    <FormGroup className="pr-1">
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>BLT</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="BLT" style={{marginRight: 10, width: 180 + 'px'}} required/>
                    </FormGroup>
                  </Form>
                </ListGroupItem>
                <ListGroupItem>
                  <Form inline={true}>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>Loading Port</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Loading Port" style={{marginRight: 10, width: 180 + 'px'}}
                             required/>
                    </FormGroup>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>Discharging Port</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Discharging Port"
                             style={{marginRight: 10, width: 180 + 'px'}}/>
                    </FormGroup>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 32}}><strong>Quantity</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Quantity" style={{marginRight: 10, width: 180 + 'px'}}/>
                    </FormGroup>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 68}}><strong>LayCan</strong></Label>
                      <Input type="select" name="select" id="select" style={{marginRight: 10, width: 180 + 'px'}}>
                        <option value="0" selected>1W</option>
                        <option value="1">2W</option>
                        <option value="2">3W</option>
                        <option value="3">4W</option>
                      </Input>
                    </FormGroup>
                  </Form>
                </ListGroupItem>
                <ListGroupItem>
                  <Form inline={true}>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 52}}><strong>Account</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Account" style={{marginRight: 10, width: 180 + 'px'}}/>
                    </FormGroup>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>Delivery Port</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Delivery Port" style={{marginRight: 10, width: 180 + 'px'}}/>
                    </FormGroup>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 5}}><strong>Redelivery Port</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Redelivery Port" style={{marginRight: 10, width: 180 + 'px'}}/>
                    </FormGroup>
                    <FormGroup className="pr-1" style={{lineHeight: 50 + 'px'}}>
                      <Label htmlFor="text-input" style={{marginRight: 34}}><strong>Quantity</strong></Label>
                      <Input type="text" id="text-input" name="text-input" placeholder="Quantity" style={{marginRight: 10, width: 180 + 'px'}}/>
                    </FormGroup>
                  </Form>
                </ListGroupItem>
                <ListGroupItem style={{height: 50 + 'px'}}>
                  <FormGroup row>
                    <Col md="3">
                      <Label><strong>Received</strong></Label>
                    </Col>
                    <Col md="9">
                      <FormGroup check inline>
                        <Input className="form-check-input" type="radio" id="inline-radio1" name="inline-radios" value="option1"/>
                        <Label className="form-check-label" check htmlFor="inline-radio1">1 day</Label>
                      </FormGroup>
                      <FormGroup check inline>
                        <Input className="form-check-input" type="radio" id="inline-radio2" name="inline-radios" value="option2"/>
                        <Label className="form-check-label" check htmlFor="inline-radio2">3 days</Label>
                      </FormGroup>
                      <FormGroup check inline>
                        <Input className="form-check-input" type="radio" id="inline-radio3" name="inline-radios" value="option3"/>
                        <Label className="form-check-label" check htmlFor="inline-radio3">1 week</Label>
                      </FormGroup>
                    </Col>
                  </FormGroup>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Card>
      );


  renderGeneral = () =>
      (
          <Card>
            <CardBody>
              <FormGroup row>
                <Col md="4">
                  <Label htmlFor="text-input"><strong>any of these words</strong></Label>
                </Col>
                <Col xs="12" md="8">
                  <Input type="text" id="text-input" name="text-input" placeholder="any of these words" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="4">
                  <Label htmlFor="text-input"><strong>all these words</strong></Label>
                </Col>
                <Col xs="12" md="8">
                  <Input type="text" id="text-input" name="text-input" placeholder="all these words" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="4">
                  <Label htmlFor="text-input"><strong>all these email addresses</strong></Label>
                </Col>
                <Col xs="12" md="8">
                  <Input type="text" id="text-input" name="text-input" placeholder="all these email addresses"
                         required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="4">
                  <Label htmlFor="text-input"><strong>none of these words</strong></Label>
                </Col>
                <Col xs="12" md="8">
                  <Input type="text" id="text-input" name="text-input" placeholder="none of these words" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="4">
                  <Label htmlFor="text-input"><strong>none of these email addresses</strong></Label>
                </Col>
                <Col xs="12" md="8">
                  <Input type="text" id="text-input" name="text-input" placeholder="none of these email addresses"
                         required/>
                </Col>
              </FormGroup>
            </CardBody>
          </Card>
      );


  render() {
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" lg="12">
              <Card>
                <CardHeader>
                  <strong>System Log</strong>
                  <Button style={{padding: 0, float: 'right'}} color="link" onClick={this.popupModel}><i
                      className="fa fa-plus"></i>&nbsp; Add Filter</Button>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                    <tr>
                      <th>Filter Name</th>
                      <th>Filter Type</th>
                      <th>From</th>
                      <th>Sent Within</th>
                      <th>Management</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>Tonnage Filter</td>
                      <td>Maritime</td>
                      <td>shipping2@gmail.com</td>
                      <td>2 Days</td>
                      <td>
                        <i className="fa fa-remove fa-lg"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i
                          className="fa fa-edit fa-lg"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Cargo Filter</td>
                      <td>Maritime</td>
                      <td>chartering@cargo.com</td>
                      <td>2 Days</td>
                      <td>
                        <i className="fa fa-remove fa-lg"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i
                          className="fa fa-edit fa-lg"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>General Filter</td>
                      <td>General</td>
                      <td>kcson@thxcloud.com</td>
                      <td>2 Days</td>
                      <td>
                        <i className="fa fa-remove fa-lg"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i
                          className="fa fa-edit fa-lg"></i>
                      </td>
                    </tr>
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Modal isOpen={this.state.modal} toggle={this.popupModel}
                 className={'modal-lg modal-info ' + this.props.className} style={{width: 1000 + 'px'}}>
            <ModalHeader toggle={this.popupModel}>Add Filter</ModalHeader>
            <ModalBody>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Filtering Name</strong></Label>
                </Col>
                <Col xs="12" md="10">
                  <Input type="text" id="text-input" name="text-input" placeholder="Filtering Name" required/>
                  <FormText color="muted">Input any filtering name you want.</FormText>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="2">
                  <Label><strong>Filter Type</strong></Label>
                </Col>
                <Col xs="12" md="10">
                  <FormGroup check inline>
                    <Input className="form-check-input" type="radio" id="inline-radio1" name="usage-radios"
                           value="option1" checked={this.state.filterType === 'General'}
                           onClick={() => {
                             this.handleFilterTypeChange('General');
                           }}/>
                    <Label className="form-check-label" check htmlFor="inline-radio1">General</Label>
                  </FormGroup>
                  <FormGroup check inline>
                    <Input className="form-check-input" type="radio" id="inline-radio2" name="usage-radios"
                           value="option2" checked={this.state.filterType === "Maritime"}
                           onClick={() => {
                             this.handleFilterTypeChange('Maritime');
                           }}/>
                    <Label className="form-check-label" check htmlFor="inline-radio2">Maritime Mail</Label>
                  </FormGroup>
                </Col>
              </FormGroup>
              {this.renderFilterOption()}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.popupModel}>Save</Button>{' '}
              <Button color="secondary" onClick={this.popupModel}>Cancel</Button>
            </ModalFooter>
          </Modal>
        </div>
    );
  }
}