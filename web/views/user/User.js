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
      id       : "",
      password : "",
      role     : 1,
      username : "",
      modal: false,
      rows: [],
      modify   : 0,
    }
  }
  popupModel = () => {
      this.setState({modal: !this.state.modal});
  };

  closeupModel = () => {
      this.setState({modal: false});
  };

  componentDidMount() {
    this.fetchData();
    // this.modalDataSave();
  }

  modalDataSave= () => {
      const { id, password, role, username, modify } = this.state;
      if (this.state.id === '' || this.state.password === '' || this.state.role === '' || this.state.username === '') {

          return;
      }
      console.log('modalDataSave in............:');
      console.log(id);
      console.log(password);
      console.log(role);
      console.log(username);
      console.log(modify);

      if(modify == 0){
          axios({
              method: 'post',
              url: '/user/save',
              data: {
                  id       : this.state.id,
                  password : this.state.password,
                  role     : this.state.role,
                  username : this.state.username
              }
          }).then(
              (response) => {
                  console.log(response);
                  if (response.data == null) {
                      this.setState({rows: []});
                      return;
                  }
                  this.fetchData();
                  this.closeupModel();
              },
              (err) => {
                  console.log(err);
                  if (err.response.status === HttpStatus.UNAUTHORIZED) {
                      this.props.history.push('/login');
                  }
              }
          )
      }else if(modify == 1){
          axios({
              method: 'post',
              url: '/user/update',
              data: {
                  id       : this.state.id,
                  password : this.state.password,
                  role     : this.state.role,
                  username : this.state.username
              }
          }).then(
              (response) => {
                  console.log(response);
                  if (response.data == null) {
                      this.setState({rows: []});
                      return;
                  }
                  this.fetchData();
                  this.closeupModel();
              },
              (err) => {
                  console.log(err);
                  if (err.response.status === HttpStatus.UNAUTHORIZED) {
                      this.props.history.push('/login');
                  }
              }
          )
      }

  }

  fetchData = () => {

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

  deleteUser = (delid) => {
      var jbResult = confirm('Are you sure you want to delete?');
      console.log('jbResult   :');
      console.log(jbResult);
      if(!jbResult){
          console.log('jbResult == false')
          this.fetchData();
      }else {
          axios({
              method: 'post',
              url: '/user/delete',
              data: {
                  id: delid
              }
          }).then(
              (response) => {
                  console.log(response);
                  if (response.data == null) {
                      this.setState({rows: []});
                      return;
                  }
                  this.fetchData();
              },
              (err) => {
                  console.log(err);
                  if (err.response.status === HttpStatus.UNAUTHORIZED) {
                      this.props.history.push('/login');
                  }
              }
          )
      }
  };

  loadUser = (id) => {
      const { modify } = this.state;
      axios({
          method: 'post',
          url: '/user/load',
          data: {
              id : id
          }
      }).then(
          (response) => {
              console.log(response);
              if (response.data == null) {
                  this.setState({rows: []});
                  return;
              }
              // console.log(response.data.id);
              // console.log(response.data.password);
              // console.log(response.data.role);
              // console.log(response.data.username);

              this.popupModel();
              document.getElementById('modelid').value=response.data.id;
              document.getElementById('modelpassword').value=response.data.password;
              document.getElementById('modelusername').value=response.data.username;
              if(response.data.role == 1)
                  document.getElementById('modelrole').value=0;
              if(response.data.role == 2)
                  document.getElementById('modelrole').value=1;
              this.setState({id: response.data.id});
              this.setState({password: response.data.password});
              this.setState({role: response.data.role});
              this.setState({username: response.data.username});
              this.setState({modify: 1});
          },
          (err) => {
              console.log(err);
              if (err.response.status === HttpStatus.UNAUTHORIZED) {
                  this.props.history.push('/login');
              }
          }
      )
  }

  handleIdChange = (event) => {
      this.setState({id: event.target.value})
  };

  handlePassChange = (event) => {
      this.setState({password: event.target.value})
  };

  handleUsernameChange = (event) => {
      this.setState({username: event.target.value})
  };

  deleteId = (event) => {
      this.deleteUser(event.target.id)
  };

  loadUserInfo = (event) => {
      this.loadUser(event.target.id)
  };

  handleRoleChange = (event) => {
      if(event.target.value == 1){
          this.setState({role: 2})
      }else if(event.target.value == 0){
          this.setState({role: 1})
      }
  };

  renderContent() {
      const {rows} = this.state
      const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 5 + 'px', paddingBottom: 5 + 'px', verticalalign: 'center'};
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
                      <td style={tdStyle}  title={row.id}>{row.id}</td>
                      <td style={tdStyle} title={row.password}>{row.password.substring(0,2)}***************</td>
                      <td style={tdStyle} title={row.role}>{row.role}</td>
                      <td style={tdStyle} title={row.username}>{row.username}</td>
                      <td onClick={this.deleteId}>
                          <i className="fa fa-remove fa-lg pr-1" id={row.id}></i>
                      </td>
                      <td onClick={this.loadUserInfo}>
                          <i className="fa fa-edit fa-lg pl-1" id={row.id}></i>
                      </td>
                  </tr>
              )
          )
      }
  }

  render() {
    const {id, password, role, username} = this.state;
    return (
        <div className="animated fadeIn">
          <Row>

            <Col xs="12" lg="12">

              <Card>
                <CardHeader>
                    <strong>User List</strong>
                    <Button style={{padding: 0, float: 'right'}} color="link" onClick={this.popupModel}><i
                        className="fa fa-plus pr-1"></i>Add user</Button>
                </CardHeader>
                <CardBody>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '25%'}}/>
                      <col style={{width: '25%'}}/>
                      <col style={{width: '12%'}}/>
                      <col style={{width: '25%'}}/>
                      <col style={{width: '7%'}}/>
                      <col style={{width: '6%'}}/>
                      <col/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th style={{verticalAlign: 'middle'}}>UserID</th>
                      <th style={{verticalAlign: 'middle'}}>Password</th>
                      <th style={{verticalAlign: 'middle'}}>Role</th>
                      <th style={{verticalAlign: 'middle'}}>UserName</th>
                      <th style={{verticalAlign: 'middle'}}></th>
                      <th style={{verticalAlign: 'middle'}}></th>
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
                                <Input type="text" name="select" id="modelid" placeholder="" onChange={this.handleIdChange}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Password</Label>
                            <Col xs="12" md="9">
                                <Input type="text" name="select" id="modelpassword" placeholder="" onChange={this.handlePassChange}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Role</Label>
                            <Col xs="12" md="9">
                                <Input type="select" name="select" id="modelrole" onChange={this.handleRoleChange}>
                                    <option value="0">Admin</option>
                                    <option value="1">User</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="col-md-3 col-form-label" htmlFor="select">Username</Label>
                            <Col xs="12" md="9">
                                <Input type="text" name="select" id="modelusername" placeholder="" onChange={this.handleUsernameChange}/>
                            </Col>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.modalDataSave}>Save</Button>{' '}
                    <Button color="secondary" onClick={this.popupModel}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
  }
}