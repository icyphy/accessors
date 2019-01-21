import React from "react";
// react plugin used to create google maps
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle,
} from "react-google-maps";

import { MarkerWithLabel } from "react-google-maps/lib/components/addons/MarkerWithLabel";

// reactstrap components
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
      console.log(evt);
      console.log(evt.target);
      console.log(evt.target.result);
      response = JSON.parse(evt.target.result);
      callback(response);
    };
    reader.readAsText(event.data);
  } else {
    response = JSON.parse(event.data);
    callback(response);
  }
}

const ParkingWrapper = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={14}
      defaultCenter={props.center}
      defaultOptions={{
        scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
        styles: [
                {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            elementType: "geometry",
            stylers: [
              {
                color: "#1d2c4d"
              }
            ]
          },
          {
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#8ec3b9"
              }
            ]
          },
          {
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#1a3646"
              }
            ]
          },
          {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#4b6878"
              }
            ]
          },
          {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#64779e"
              }
            ]
          },
          {
            featureType: "administrative.province",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#4b6878"
              }
            ]
          },
          {
            featureType: "landscape.man_made",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#334e87"
              }
            ]
          },
          {
            featureType: "landscape.natural",
            elementType: "geometry",
            stylers: [
              {
                color: "#023e58"
              }
            ]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [
              {
                color: "#283d6a"
              }
            ]
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#6f9ba5"
              }
            ]
          },
          {
            featureType: "poi",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#1d2c4d"
              }
            ]
          },
          {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#023e58"
              }
            ]
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#3C7680"
              }
            ]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              {
                color: "#304a7d"
              }
            ]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#98a5be"
              }
            ]
          },
          {
            featureType: "road",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#1d2c4d"
              }
            ]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [
              {
                color: "#2c6675"
              }
            ]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#9d2a80"
              }
            ]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#9d2a80"
              }
            ]
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#b0d5ce"
              }
            ]
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#023e58"
              }
            ]
          },
          {
            featureType: "transit",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#98a5be"
              }
            ]
          },
          {
            featureType: "transit",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#1d2c4d"
              }
            ]
          },
          {
            featureType: "transit.line",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#283d6a"
              }
            ]
          },
          {
            featureType: "transit.station",
            elementType: "geometry",
            stylers: [
              {
                color: "#3a4762"
              }
            ]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [
              {
                color: "#0e1626"
              }
            ]
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#4e6d70"
              }
            ]
          }
        ]
      }}
    >
      <Circle center={props.center} radius={50} options={{fillColor: "DodgerBlue", fillOpacity:1.0, strokeColor:"White", strokeWeight:1}} />
      <Marker position={{ lat: 37.8816, lng: -122.2827 }} />
      <MarkerWithLabel
      position={{ lat: 37.8616, lng: -122.2627 }}
      labelAnchor={new google.maps.Point(22, 0)}
      labelStyle={{opacity: 0.75}}
      >
        <Card>
        <CardHeader>
        <CardTitle tag="h2">Display Name</CardTitle>
        </CardHeader>
        </Card>
      </MarkerWithLabel>

    </GoogleMap>
  ))
);


var ws;

class Parking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: "YOUR_KEY__MUST_BE_LOADED_HERE",
    };
    var thiz = this;
  }

  componentDidMount(){
    var thiz = this;
    //Tell controller to ready a list of parking locations with information
    //and to provide a google maps API key
    ws = new WebSocket('ws://localhost:8095/');
    ws.onopen = function(){
      var startMessage = {
        "id" : "parking",
        "msg" : "start"
      }
      console.log("Sending parking message to controller.");
      ws.send(JSON.stringify(startMessage));
    };
    ws.onmessage = function(event) {
      console.log("GOT EVENT FROM CONTROLLER!");
       eventToJSON(event, function(response){
        if(response.id && response.id === "parking" && response.apiKey){
          console.log("started parking if!");
          
          thiz.setState({apiKey: response.apiKey});
        }
      });
    }.bind(thiz);
  }

  componentWillUnmount() {
    ws.close();
  }

  render() {
    if(this.state.apiKey == "YOUR_KEY__MUST_BE_LOADED_HERE"){
      return (<h2> API key not loaded yet </h2> );
    } else {
      return (
        <>
          <div className="content">
            <Row>
              <Col md="7">
                <Card className="card-plain">
                  {/* <CardHeader>Google Maps + {this.state.apiKey}</CardHeader> */}
                  <CardBody style={{"padding": "0px"}}>
                    <div
                      id="map"
                      className="map"
                      style={{ position: "relative", overflow: "hidden" }}
                    >

                      <ParkingWrapper
                        googleMapURL={"https://maps.googleapis.com/maps/api/js?key=" + this.state.apiKey}
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `100%` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                        center={{ lat: 37.8716, lng: -122.2727 }}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md="5">
              <Card className="card-tasks">
                <CardHeader>
                  <h6 className="title d-inline">Results (5)</h6>
                  <p className="card-category d-inline"> 8:23 AM Date</p>
                  <UncontrolledDropdown>
                    <DropdownToggle
                      caret
                      className="btn-icon"
                      color="link"
                      data-toggle="dropdown"
                      type="button"
                    >
                      <i className="tim-icons icon-settings-gear-63" />
                    </DropdownToggle>
                    <DropdownMenu aria-labelledby="dropdownMenuLink" right>
                      <DropdownItem
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        Sort by Price
                      </DropdownItem>
                      <DropdownItem
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                      >
                        Sort by Distance
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </CardHeader>
                <CardBody>
                  <div className="table-full-width table-responsive">
                    <Table>
                      <thead className="text-primary">
                        <tr>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <p className="title">Display Name1</p>
                            <p className="text-muted">
                              Dwuamish Head, Seattle, WA 8:47 AM
                            </p>
                          </td>
                          <td>
                          <p>
                          $3.45
                          </p>
                          </td>
                          <td>
                          <p>
                          2.17 mi
                          </p>
                          </td>
                          <td className="td-actions text-right">
                            <Button
                              color="link"
                              id="tooltip636901683"
                              title=""
                              type="button"
                            >
                              <i className="tim-icons icon-triangle-right-17" />
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip636901683"
                              placement="right"
                            >
                              Get Accessor
                            </UncontrolledTooltip>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p className="title">Display Name2</p>
                            <p className="text-muted">
                              Address 2
                            </p>
                          </td>
                          <td>
                          <p>
                          $3.45
                          </p>
                          </td>
                          <td>
                          <p>
                          2.17 mi
                          </p>
                          </td>
                          <td className="td-actions text-right">
                            <Button
                              color="link"
                              id="tooltip457194718"
                              title=""
                              type="button"
                            >
                              <i className="tim-icons icon-triangle-right-17" />
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip457194718"
                              placement="right"
                            >
                              Get Accessor
                            </UncontrolledTooltip>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p className="title">Display Name3</p>
                            <p className="text-muted">
                              Address 3
                            </p>
                          </td>
                          <td>
                          <p>
                          $3.45
                          </p>
                          </td>
                          <td>
                          <p>
                          2.17 mi
                          </p>
                          </td>
                          <td className="td-actions text-right">
                            <Button
                              color="link"
                              id="tooltip362404923"
                              title=""
                              type="button"
                            >
                              <i className="tim-icons icon-triangle-right-17" />
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip362404923"
                              placement="right"
                            >
                              Get Accessor
                            </UncontrolledTooltip>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p className="title">Display Name4</p>
                            <p className="text-muted">
                              Address 4
                            </p>
                          </td>
                          <td>
                          <p>
                          $3.45
                          </p>
                          </td>
                          <td>
                          <p>
                          2.17 mi
                          </p>
                          </td>
                          <td className="td-actions text-right">
                            <Button
                              color="link"
                              id="tooltip818217463"
                              title=""
                              type="button"
                            >
                              <i className="tim-icons icon-triangle-right-17" />
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip818217463"
                              placement="right"
                            >
                              Get Accessor
                            </UncontrolledTooltip>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p className="title">Display Name5</p>
                            <p className="text-muted">
                              Address 5
                            </p>
                          </td>
                          <td>
                          <p>
                          $3.45
                          </p>
                          </td>
                          <td>
                          <p>
                          2.17 mi
                          </p>
                          </td>
                          <td className="td-actions text-right">
                            <Button
                              color="link"
                              id="tooltip831835125"
                              title=""
                              type="button"
                            >
                              <i className="tim-icons icon-triangle-right-17" />
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip831835125"
                              placement="right"
                            >
                              Get Accessor
                            </UncontrolledTooltip>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p className="title">DisplayName 6</p>
                            <p className="text-muted">
                              Address 6
                            </p>
                          </td>
                          <td>
                          <p>
                          $3.45
                          </p>
                          </td>
                          <td>
                          <p>
                          2.17 mi
                          </p>
                          </td>
                          <td className="td-actions text-right">
                            <Button
                              color="link"
                              id="tooltip217595172"
                              title=""
                              type="button"
                            >
                              <i className="tim-icons icon-triangle-right-17" />
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip217595172"
                              placement="right"
                            >
                              Get Accessor
                            </UncontrolledTooltip>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
              </Col>
            </Row>
          </div>
        </>
      );
    }
  }
}

export default Parking;
