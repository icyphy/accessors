import React from "react";
import ReactDOM from "react-dom";

// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4
} from "variables/charts.jsx";

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM. Just call retargetEvents on shadowRoot.
import retargetEvents from 'react-shadow-dom-retarget-events';

class GraphElement extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
        <div className="chart-area">
          <Bar
            data={chartExample3.data}
            options={chartExample3.options}
          />          
        </div>
        )
        , mountPoint);
  }
}
customElements.define('graph-element', GraphElement);
