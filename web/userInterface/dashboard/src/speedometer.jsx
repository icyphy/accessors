import React from 'react';
import ReactDOM from "react-dom";

import ReactSpeedometer from "react-d3-speedometer"

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

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
    <ReactSpeedometer
            minValue={0}
            maxValue={170}
            value={this.state.speed}
          />
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