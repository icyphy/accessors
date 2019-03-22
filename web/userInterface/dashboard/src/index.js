import React from "react";
import ReactDOM from "react-dom";
// import { createBrowserHistory } from "history";
// import { createHashHistory } from "history";
import { createMemoryHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";

import AdminLayout from "layouts/Admin/Admin.jsx";
import RTLLayout from "layouts/RTL/RTL.jsx";

import "assets/scss/black-dashboard-react.scss";
import "assets/example/demo.css";
import "assets/css/nucleo-icons.css";

//const hist = createBrowserHistory();
const memoryHistory = createMemoryHistory();
//const hashHistory = createHashHistory();

ReactDOM.render(
  <Router history={memoryHistory}>
    <Switch>
      <Route path="/admin" render={props => <AdminLayout {...props} />} />
      <Route path="/rtl" render={props => <RTLLayout {...props} />} />
      <Redirect from="/" to="/admin/dashboard" />
    </Switch>
  </Router>,
  document.getElementById("root")
);
