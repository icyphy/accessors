import React from 'react';
import ReactDOM from "react-dom";
import { Player, BigPlayButton } from 'video-react';

import retargetEvents from 'react-shadow-dom-retarget-events';

class VideoComponent extends HTMLElement {

  connectedCallback() {

    console.log("I am video fun!");
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);

    ReactDOM.render(
        (
        
        <div className="chart-area">
            <link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" />
                <Player src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4">
                  <BigPlayButton position="center" />
                </Player>
        </div>
        )
        , mountPoint);
  }
}
customElements.define('replace-me', VideoComponent);