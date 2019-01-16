import React from 'react';
import ReactDOM from "react-dom";
import Odometer from 'react-odometerjs';

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';


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
          <link rel="stylesheet" href="../lib/odometer-theme-car.css" />
          <OdometerControler/>
        </div>
        ), mountPoint);
  }
}
customElements.define('__componentName__', OdometerComponent);