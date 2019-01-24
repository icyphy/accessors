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

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle
} from "reactstrap";

//FIXME I believe bootstrap isn't being loaded correctly into the component. I tried linking
// and importing these style sheets, but it didn't fix resizing issues.
//The chart-area div class is defined in this stylesheet
//import * as styles from "assets/scss/black-dashboard-react.scss";
//import "lib/css/black-dashboard-react.css";

//<link rel="stylesheet" href="../lib/black-dashboard-react.css" /> 

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM. Just call retargetEvents on shadowRoot.
import retargetEvents from 'react-shadow-dom-retarget-events';


console.log("graphElement is being evaled!");
class GraphElement extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
          <div className="chart-area">
          <link rel="stylesheet" href="../lib/black-dashboard-react.css" />
          <link rel="stylesheet" href="../lib/nucleo-icons.css" />
            <Card className="card-chart">
            <CardHeader>
              <h5 className="card-category">Graph Component</h5>
            </CardHeader>
            <CardBody>
            <Bar
              data={chartExample3.data}
              options={chartExample3.options}
            />          
          </CardBody>
          </Card>
          </div>
        )
        , mountPoint);
  }
}
customElements.define('__componentName__', GraphElement);