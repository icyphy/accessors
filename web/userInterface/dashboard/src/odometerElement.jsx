import React from 'react';
import ReactDOM from "react-dom";
import Odometer from 'react-odometerjs';

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle
} from "reactstrap";

class OdometerControler extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      count: 12345
    };
  }

  componentDidMount() {
    var thiz = this;

    setInterval(function(){
      thiz.setState({speed: ++thiz.state.count});
      //console.log("incrementing speed 55");
     }, 3000);

  }

  render(){
    return (
        <Odometer value={this.state.count} format="(.ddd),dd"/>
          )
  }
}

class OdometerComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
                <div>
        {/* This link to the stylesheet is necessary for the component to be correctly styled */}
           <link rel="stylesheet" href="../lib/odometer-theme-car.css" />
          <link rel="stylesheet" href="../lib/black-dashboard-react.css" />
          <link rel="stylesheet" href="../lib/nucleo-icons.css" />
            <Card className="card-chart">
            <CardHeader>
            <h5 className="card-category">Odometer Component</h5>
            </CardHeader>
            <CardBody>
            <OdometerControler/>
            </CardBody>
            </Card>
        </div>
        ), mountPoint);
  }
}
customElements.define('__componentName__', OdometerComponent);