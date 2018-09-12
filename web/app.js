import "babel-polyfill";
import React, {Component} from 'react';
import {HashRouter, Route, Switch, BrowserRouter} from 'react-router-dom';
// Styles
// Import Flag Icons Set
import 'flag-icon-css/css/flag-icon.min.css';
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import Main styles for this application
import './scss/style.css'
// Containers
import {Full} from './containers';
// Pages
import {Login, Page404, Page500, Register} from './views/Pages';
// import '../node_modules/@coreui/styles/scss/_dropdown-menu-right.scss';

// import { renderRoutes } from 'react-router-config';
//import 'semantic-ui-css/semantic.min.css';
import "storm-react-diagrams/dist/style.min.css";

export default class App extends Component {
  render() {
    return (
        <BrowserRouter>
          <Switch>
            <Route exact path="/login" name="Login Page" component={Login}/>
            <Route exact path="/register" name="Register Page" component={Register}/>
            <Route exact path="/404" name="Page 404" component={Page404}/>
            <Route exact path="/500" name="Page 500" component={Page500}/>
            <Route path="/" name="Home" component={Full} />
          </Switch>
        </BrowserRouter>
    );
  }
}