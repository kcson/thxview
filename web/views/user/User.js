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
    Label, Modal, ModalBody, ModalFooter, ModalHeader,
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

export default class User extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      rows: []
    }
  }
  popupModel = () => {
      this.setState({modal: !this.state.modal});
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    axios({
      method: 'post',
      url: '/user/list',
      data: {

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
  }


  renderContent() {
      const {rows} = this.state
      const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 4 + 'px', paddingBottom: 4 + 'px'};
      if (rows.length == 0) {
          return (
              <tr>
                  <td colSpan={4} style={{textAlign: 'center'}}>No data.</td>
              </tr>
          )
      } else {
          return (
              rows.map((row, index) =>
                  <tr>
                      <td style={tdStyle} title={row.id}>{row.id}</td>
                      <td style={tdStyle} title={row.password}>{row.password.substring(0,2)}***************</td>
                      <td style={tdStyle} title={row.role}>{row.role}</td>
                      <td style={tdStyle} title={row.username}>{row.username}</td>
                  </tr>
              )
          )
      }
  }

  render() {
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" lg="12">

              <Card>
                <CardHeader>
                    <strong>User List</strong>
                    <Button style={{padding: 0, float: 'right'}} color="link" onClick={this.popupModel}><i
                        className="fa fa-plus pr-1"></i>Add page</Button>
                </CardHeader>
                <CardBody>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '25%'}}/>
                      <col style={{width: '25%'}}/>
                      <col style={{width: '25%'}}/>
                      <col style={{width: '25%'}}/>
                      <col/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>UserID</th>
                      <th style={{verticalAlign: 'middle'}}>Password</th>
                      <th style={{verticalAlign: 'middle'}}>Role</th>
                      <th style={{verticalAlign: 'middle'}}>UserName</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderContent()}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
            <Modal isOpen={this.state.modal} toggle={this.popupModel}>
                <ModalHeader toggle={this.popupModel}>Add user</ModalHeader>
                <ModalBody>
                    <Form className="form-horizontal">
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Id</Label>
                            <Col xs="12" md="9">
                                <Input type="text" name="select" id="select" placeholder=""/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Password</Label>
                            <Col xs="12" md="9">
                                <Input type="text" name="select" id="select" placeholder=""/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Role</Label>
                            <Col xs="12" md="9">
                                <Input type="select" name="select" id="select">
                                    <option value="0">Admin</option>
                                    <option value="1">User</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Username</Label>
                            <Col xs="12" md="9">
                                <Input type="text" name="select" id="select" placeholder=""/>
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