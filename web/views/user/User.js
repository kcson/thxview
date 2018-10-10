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
import DatePicker from 'react-datepicker'
import * as HttpStatus from "http-status-codes/index";

import 'react-datepicker/dist/react-datepicker.css';

export default class User extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      rows: []
    }
  }

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
                      <td style={tdStyle} title={row.password}>{row.password}</td>
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
                </CardHeader>
                <CardBody>
                  <Table style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '30%'}}/>
                      <col style={{width: '30%'}}/>
                      <col style={{width: '10%'}}/>
                      <col style={{width: '30%'}}/>
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
        </div>
    );
  }
}