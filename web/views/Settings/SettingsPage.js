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
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table
} from 'reactstrap';

export default class SettingsPage extends Component {
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
                      <Input type="text" id="text-input" name="text-input" placeholder="Redelivery Port"
                             style={{marginRight: 10, width: 180 + 'px'}}/>
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
                  <strong>Pages</strong>
                  <Button style={{padding: 0, float: 'right'}} color="link" onClick={this.popupModel}><i
                      className="fa fa-plus pr-1"></i>Add page</Button>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                    <tr>
                      <th>Type/Page</th>
                      <th>Page</th>
                      <th>Description</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>Purchases</td>
                      <td>/purchase</td>
                      <td>Purchases</td>
                      <td>
                        <i className="fa fa-remove fa-lg pr-1"></i><i className="fa fa-edit fa-lg pl-1"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Registrations</td>
                      <td>/signup</td>
                      <td></td>
                      <td>
                        <i className="fa fa-remove fa-lg pr-1"></i><i className="fa fa-edit fa-lg pl-1"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>General</td>
                      <td>/product</td>
                      <td>Product page</td>
                      <td>
                        <i className="fa fa-remove fa-lg pr-1"></i><i className="fa fa-edit fa-lg pl-1"></i>
                      </td>
                    </tr>
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Modal isOpen={this.state.modal} toggle={this.popupModel}>
            <ModalHeader toggle={this.popupModel}>Add page</ModalHeader>
            <ModalBody>
              <Form className="form-horizontal">
                <FormGroup row>
                  <Label className="col-md-3 col-form-label" htmlFor="select">Type/Page</Label>
                  <Col xs="12" md="9">
                    <Input type="select" name="select" id="select">
                      <option value="0">Purchases</option>
                      <option value="1">Registrations</option>
                      <option value="2">General</option>
                    </Input>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label className="col-md-3 col-form-label" htmlFor="select">Page</Label>
                  <Col xs="12" md="9">
                    <Input type="text" name="select" id="select" placeholder="/register"/>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label className="col-md-3 col-form-label" htmlFor="select">Description</Label>
                  <Col xs="12" md="9">
                    <Input type="text" name="select" id="select" />
                  </Col>
                </FormGroup>
              </Form>
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