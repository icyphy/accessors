import React from 'react';
import ReactDOM from "react-dom";
import { Player, BigPlayButton } from 'video-react';

//It appears this import is necessary to make the video correctly appear
//and it is also necessary to link the stylesheet within the web component itself
import "video-react/dist/video-react.css";

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle
} from "reactstrap";

class VideoComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
        <div>
        {/* This link to the stylesheet is necessary for the component to be correctly styled */}
          <link rel="stylesheet" href="../lib/video-react.css" />
          { /* <link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css"/> */}
          {/* <link rel="stylesheet" href="../lib/metaSheet.css" /> */}
          <link rel="stylesheet" href="../lib/black-dashboard-react.css" />
          <link rel="stylesheet" href="../lib/nucleo-icons.css" />
            <Card className="card-chart">
            <CardHeader>
            <h5 className="card-category">Video Component</h5>
            </CardHeader>
            <CardBody>
            <h3> Intersection of Alpha Ave. and Beta St.</h3>
              <Player src="__videoSource__">
              <BigPlayButton position="center" />
            </Player>
            </CardBody>
            </Card>
        </div>
        )
        , mountPoint);
  }
}
customElements.define('__componentName__', VideoComponent);
