import React from 'react';
import ReactDOM from "react-dom";
import { Player, BigPlayButton } from 'video-react';

//It appears this import is necessary to make the video correctly appear
//and it is also necessary to link the stylesheet within the web component itself
import "video-react/dist/video-react.css";

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

class VideoComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
        <div>
            {/* Remote link to stylesheet */}
            {/* <link rel="stylesheet" href="https://video-react.github.io/assets/video-react.css" /> */}
            
            {/* This link to the stylesheet is necessary for the component to be correctly styled */}
           <link rel="stylesheet" href="lib/video-react.css" />
            <Player src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4">
              <BigPlayButton position="center" />
            </Player>
        </div>
        )
        , mountPoint);
  }
}
customElements.define('replace-me', VideoComponent);