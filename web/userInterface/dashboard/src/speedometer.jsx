import React from 'react';
import ReactDOM from "react-dom";

import ReactSpeedometer from "react-d3-speedometer"

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle
} from "reactstrap";


class SpeedometerControler extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      speed: 0
    };
  }

  componentDidMount() {
    var thiz = this;

    setInterval(function(){ 
      thiz.setState({speed: 55});
      //console.log("setting to 55");
     }, 1000);
    
    setTimeout( setInterval( function(){
      thiz.setState({speed: 57});
      //console.log("setting to 57");
    }, 1500), 1000);

  }

  render(){
    return (
      <div className="chart-area">
          <link rel="stylesheet" href="../lib/black-dashboard-react.css" />
          <link rel="stylesheet" href="../lib/nucleo-icons.css" />
            <Card className="card-chart">
            <CardHeader>
            <h5 className="card-category">Speedometer Component</h5>
            </CardHeader>
            <CardBody>
            <ReactSpeedometer
                    minValue={0}
                    maxValue={170}
                    value={this.state.speed}
                  />
            </CardBody>
            </Card>
      </div>
      )
  }

}


class SpeedometerComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
        <div>
          <SpeedometerControler/>
        </div>
        )
        , mountPoint);
  }
}
customElements.define('__componentName__', SpeedometerComponent);