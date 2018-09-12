import React, {Component} from 'react';
import {Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row} from 'reactstrap';
import axios from 'axios';

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: "",
      password: ""
    };
  }

  handleUserNameChange = e => {
    this.setState({username: e.target.value})
  };

  handlePasswordChange = e => {
    this.setState({password: e.target.value})
  };

  handleAuth = () => {
    console.log(this.state.username);
    console.log(this.state.password);
    if (this.state.username === '' || this.state.password === '') {
      return;
    }

    axios({
      method: 'post',
      url: '/auth',
      data: {
        username: this.state.username,
        password: this.state.password
      }
    }).then(
        (response) => {
          console.log(response)
          if(response.data.auth === 'success') {
            sessionStorage.userid = this.state.username
            sessionStorage.username = this.state.username
            this.props.history.push('/');
          }
        },
        (err) => {
          console.log(err);
        }
    )
  };

  render() {
    return (
        <div className="app flex-row align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col md="8">
                <CardGroup>
                  <Card className="p-4">
                    <CardBody>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" value={this.state.username} onChange={this.handleUserNameChange} placeholder="Username"/>
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" value={this.state.password} onChange={this.handlePasswordChange} placeholder="Password"/>
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4" onClick={this.handleAuth}>Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                  <Card className="py-5 d-md-down-none" style={{width: 44 + '%'}}>
                    <CardBody className="text-center">
                      <div>
                        <h2>Sign up</h2>
                        <img src={"/public/img/brand/THXCLOUD_LOGO1.svg"}></img>
                        {/*<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
                          incididunt ut labore et dolore magna aliqua.</p>*/}
                        <Button color="primary" className="mt-3" active>Register Now!</Button>
                      </div>
                    </CardBody>
                  </Card>
                </CardGroup>
              </Col>
            </Row>
          </Container>
        </div>
    );
  }
}

export default Login;
