import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4
} from "variables/charts.jsx";

import Gallery from 'react-photo-gallery';

const PHOTO_SET = [
  {
    src: '../food/item1.jpeg',
    width: 1,
    height: 1
  },
  {
    src: '../food/item2.jpeg',
    width: 1,
    height: 1
  },
    {
    src: '../food/item3.jpeg',
    width: 1,
    height: 1
  },
    {
    src: '../food/item4.jpeg',
    width: 1,
    height: 1
  },
    {
    src: '../food/item5.jpeg',
    width: 1,
    height: 1
  },
  {
    src: '../food/item6.jpeg',
    width: 1,
    height: 1
  },
    {
    src: '../food/item7.jpeg',
    width: 1,
    height: 1
  },
    {
    src: '../food/item8.jpeg',
    width: 1,
    height: 1
  },
];

//Variable incremented to construct unique component names
var componentCount = 0;

//Helper function to refactor websocket code
//processing blobs and strings.
//Event is the event from the websocket
//Callback is a function with one (string) argument, which will be
//invoked on the response extracted from event.
function eventToJSON(event, callback) {
  var response;
  if(event.data instanceof Blob) {
    var reader = new FileReader();
    reader.onload = function(evt) {
      response = JSON.parse(evt.target.result);
      callback(response);
    };
    reader.readAsText(event.data);
  } else {
    response = JSON.parse(event.data);
    callback(response);
  }
}


function evalComponents(componentStrings){
  for(var componentName in componentStrings){
    //Duplicate component definitions are not allowed, so first check
    //to make sure the component hasn't been registered already.
    if(customElements.get(componentName) == undefined){
      console.log("evaling element:" + componentName);
      eval(componentStrings[componentName]);
    }
  }
}

//React component which renders a Card for each webcomponent 
class AccessorCards extends React.Component {

  generateCards(){
    var cardArray = [];
    for(var name in this.props.componentStrings){

      //One of React's quirks is it only allows a dynamic element name,
      //if that name is assigned to a variable with a capitalized first letter. 
      const CapitalizedName = name;
      console.log("generating card for:" + name);
      cardArray.push(
        <Col key={name} lg="6">
              <CapitalizedName/>
        </Col>
      );
    }
    return cardArray;
  }
  render() {
    return (<Row>
              {this.generateCards()}                
            </Row>);
  }
}

var ws;

class Dashboard extends React.Component {

  componentDidMount() {
    var thiz = this;
    //Websocket for communicating with the UI Swarmlet about the
    //state of the system (eg. availble accessor components).
    ws = new WebSocket('ws://localhost:8095/');
    ws.onopen = function(){
      var startMessage = {
        "id" : "system",
        "msg" : "start"
      }
      console.log("Sending start message to controller.");
      ws.send(JSON.stringify(startMessage));
    };

    ws.onmessage = function(event) {
       eventToJSON(event, function(response){
        // console.log("got a message!");
        // console.log(response.id);
        // console.log(JSON.stringify(response));
        // console.log(response);
        if(response.id && response.id === "system" && response.component){
          console.log("started if!");
          //Create the full component by replacing the special string __componentName__ with a unique name
          var componentName = "accessor-" + componentCount.toString();
          componentCount++;
          var newComponent = response.component.replace('__componentName__', componentName);

          //Create a copy of the old component state object, then add the new one
          //keyed to the component's name.
          var newComponentStrings = Object.assign(thiz.state.componentStrings, {});
          newComponentStrings[componentName] = newComponent;
          thiz.setState({componentStrings: newComponentStrings});
        }
      });
    }.bind(thiz);
  }

  componentWillUnmount() {
    ws.close();
  }

  constructor(props) {
    super(props);
    this.state = {
      bigChartData: "data1",
      count: -1,
      componentStrings: {}
    };
    var thiz = this;
  }

  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };

  render() {
    return (
      <>
        <script>{evalComponents(this.state.componentStrings)}</script>
        <div className="content">
          <AccessorCards componentStrings={this.state.componentStrings}></AccessorCards>
          
        </div>
      </>
    );
  }
}

export default Dashboard;
