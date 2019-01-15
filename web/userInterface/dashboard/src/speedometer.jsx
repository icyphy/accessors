import React from 'react';
import ReactDOM from "react-dom";

import ReactSpeedometer from "react-d3-speedometer"

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

class SpeedometerComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
        <div>
          <ReactSpeedometer
            minValue={0}
            maxValue={170}
            value={56}
          />
        </div>
        )
        , mountPoint);
  }
}
customElements.define('__componentName__', SpeedometerComponent);