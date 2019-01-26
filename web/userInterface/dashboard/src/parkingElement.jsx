import React from 'react';
import ReactDOM from "react-dom";
import Odometer from 'react-odometerjs';

//This import is needed to fix a bug with React not handling events which occur in
//shadow DOM
import retargetEvents from 'react-shadow-dom-retarget-events';

import { Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  UncontrolledTooltip,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  ButtonGroup,
} from "reactstrap";

//FIXME Refactor this function across pages (Dashboard and this) instead of duplicating it.
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


function generateTableRows(spotData){
  if(spotData.length == 0){
    return <p> Loading ... </p>
  } else {
    var table = [];
    for(var i= 0; i < spotData.length; i++){
      var children = [];
      children.push(        <td>
                              <FormGroup check id={spotData[i].spotID}>
                                <Label check>
                                  <Input defaultValue="" type="checkbox" />
                                  <span className="form-check-sign">
                                    <span className="check" />
                                  </span>
                                </Label>
                              </FormGroup>
                            </td>);
      children.push(<td><p className="title">{spotData[i].floor}</p></td>);
      children.push(<td><p className="title">{spotData[i].zone}</p></td>);
      children.push(<td><p className="title">{spotData[i].number}</p></td>);
      table.push(<tr key={spotData[i].spotID}>{children}</tr>);
    }
    return table;
  }

}

class ParkingControler extends React.Component{

  constructor(props) {
    super(props);

    //This special string is replaced by ParkingComponent with the accessor's parameter.
    //This ensures messages are routed to this element.
    this.componentID = "__componentID__";
    this.state = {
      spotData: []
    };
  }

  componentDidMount(){
    var thiz = this;
    ws = new WebSocket('ws://localhost:8095/');
      ws.onopen = function(){
        var startMessage = {
          "id" : thiz.componentID,
          "msg" : "findAvailable"
        }
        console.log("Sending findAvailable parking message to accessor.");
        console.log(startMessage);
        ws.send(JSON.stringify(startMessage));
      };
      ws.onmessage = function(event) {
        console.log("GOT EVENT FROM Accessor!");
         eventToJSON(event, function(response){
          if(response.id && response.id === thiz.componentID && response.spotData){
            console.log("started parkingElement if!");
            thiz.setState({spotData: response.spotData});
          }
        });
      }.bind(thiz);
    }

  componentWillUnmount() {
    ws.close();
  }

  render(){
    return (
        <Card>
                <CardHeader>
                <h5 className="card-category">Parking Component</h5>
                </CardHeader>
                <CardBody style={{"padding": "0px"}}>
                <img src="../parking/lot.jpg" alt="Empty parking lot" height="200" width="300"
                      style={{display: "block", "margin-left": "auto", "margin-right": "auto"}}/>
                  <Row>
                  <Col lg={{ size: 10, offset: 1 }}>
                  <Card className="card-tasks">

                  <CardHeader>
                    <h3 className="title d-inline">Parking at Downtown Lot</h3>
                    <p className="text-muted">
                      $5.00
                    </p>
                    <Row>
                    <Col lg="6">
                    
                      <p className="title">Payment Information: </p>
                    </Col>
                    <Col lg="6">
                       <p className="text-muted">xxxx-xxxx-xxxx-1234 </p>
                    </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <div className="table-full-width table-responsive" style={{ "overflow-y": "auto", "overflow-x": "auto" }}>
                      <Table>
                        <thead className="text-primary">
                        <tr>
                          <th>Select</th>
                          <th>Floor</th>
                          <th>Zone</th>
                          <th>Number</th>
                        </tr>
                      </thead>
                        <tbody>
                        {generateTableRows(this.state.spotData)}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                  </Card>
                  </Col>
                  </Row>
                  <Button
                              block
                              color="primary"
                              onClick={e => e.preventDefault()}
                            >
                              Proceed to Checkout
                            </Button>
                  </CardBody>
                </Card>
        )
  }

}

class ParkingComponent extends HTMLElement {

  connectedCallback() {
    const mountPoint = document.createElement('span');
    var shadowRoot = this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
    retargetEvents(shadowRoot);
    ReactDOM.render(
        (
          //Put the card inside the component? That way I can give it the right class
          <div>
          <link rel="stylesheet" href="../lib/black-dashboard-react.css" />
          <link rel="stylesheet" href="../lib/nucleo-icons.css" />
          <ParkingControler/>
          </div>
        ), mountPoint);
  }
}
customElements.define('__componentName__', ParkingComponent);