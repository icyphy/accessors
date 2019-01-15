import React from 'react';
import ReactDOM from "react-dom";
import Odometer from 'react-odometerjs';

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

class OdometerComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
        <div>
          <link rel="stylesheet" href="../lib/odometer-theme-car.css" />
          <Odometer value={12345678} format="(.ddd),dd"/>
        </div>
        )
        , mountPoint, function(){
          /*The odometer only updates with the animation if its innerText is changed
          without rerendering the element. */

           ReactDOM.render(
            (        <div>
          <link rel="stylesheet" href="../lib/odometer-theme-car.css" />
          <Odometer value={99999999} format="(.ddd),dd"/>
          </div>), mountPoint);

        });
    
  }
}
customElements.define('__componentName__', OdometerComponent);