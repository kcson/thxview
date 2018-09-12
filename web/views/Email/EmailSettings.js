import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table
} from 'reactstrap';

export default class EmailSettings extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      collapse: true,
      modal: false
    };
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  popupModel = () => {
    this.setState({modal: !this.state.modal});
  };

  render() {
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" md="12">
              <Card>
                <CardHeader>
                  <strong>Common Settings</strong>
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                    <FormGroup row>
                      <Col md="3">
                        <Label>Usage Type</Label>
                      </Col>
                      <Col md="9">
                        <FormGroup check inline>
                          <Input className="form-check-input" type="radio" id="inline-radio1" name="usage-radios"
                                 value="option1"/>
                          <Label className="form-check-label" check htmlFor="inline-radio1">General</Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input className="form-check-input" type="radio" id="inline-radio2" name="usage-radios"
                                 value="option2"/>
                          <Label className="form-check-label" check htmlFor="inline-radio2">Maritime Mail</Label>
                        </FormGroup>
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md="3">
                        <Label htmlFor="select">Email Retention Period</Label>
                      </Col>
                      <Col xs="12" md="3">
                        <Input type="select" name="select" id="select">
                          <option value="0">Please select</option>
                          <option value="1">3 months</option>
                          <option value="2">6 months</option>
                          <option value="3">1 year</option>
                          <option value="3">2 year</option>
                          <option value="3">3 year</option>
                          <option value="3">Unlimited</option>
                        </Input>
                      </Col>
                    </FormGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button type="submit" size="sm" color="primary"><i className="fa fa-dot-circle-o"></i> Submit</Button>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs="12" md="12">
              <Card>
                <CardHeader>
                  <span><strong>Email Account</strong></span>
                  <Button style={{padding: 0, float: 'right'}} color="link" onClick={this.popupModel}><i
                      className="fa fa-plus"></i>&nbsp; Add Account</Button>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                    <tr>
                      <th>Email</th>
                      <th>Incoming Mail Server</th>
                      <th>Type</th>
                      <th>Port</th>
                      <th>Description</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>abc@gmail.com</td>
                      <td>imap.gmail.com</td>
                      <td>imap</td>
                      <td>993</td>
                      <td>Gmail IMAP</td>
                      <td><i className="fa fa-remove fa-lg"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i
                          className="fa fa-edit fa-lg"></i></td>
                    </tr>
                    <tr>
                      <td>abc@gmail.com</td>
                      <td>pop.gmail.com</td>
                      <td>pop3</td>
                      <td>995</td>
                      <td>Gmail POP3</td>
                      <td><i className="fa fa-remove fa-lg"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i
                          className="fa fa-edit fa-lg"></i></td>
                    </tr>
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Modal isOpen={this.state.modal} toggle={this.popupModel} className={'modal-lg modal-info ' + this.props.className}>
            <ModalHeader toggle={this.popupModel}>Add Account</ModalHeader>
            <ModalBody>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Email</strong></Label>
                </Col>
                <Col xs="12" md="10">
                  <Input type="text" id="text-input" name="text-input" placeholder="Email" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Password</strong></Label>
                </Col>
                <Col xs="12" md="10">
                  <Input type="password" id="text-input" name="text-input" placeholder="Password" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Incoming Mail Server</strong></Label>
                </Col>
                <Col xs="12" md="10">
                  <Input type="text" id="text-input" name="text-input" placeholder="imap.gmail.com" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Type</strong></Label>
                </Col>
                <Col xs="12" md="3">
                  <Input type="select" name="select" id="select">
                    <option value="0">imap</option>
                    <option value="1">pop3</option>
                  </Input>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Port</strong></Label>
                </Col>
                <Col xs="12" md="3">
                  <Input type="text" id="text-input" name="text-input" placeholder="ex) 993" required/>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col md="2">
                  <Label htmlFor="text-input"><strong>Description</strong></Label>
                </Col>
                <Col xs="12" md="10">
                  <Input type="text" id="text-input" name="text-input" placeholder="Description" required/>
                </Col>
              </FormGroup>
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