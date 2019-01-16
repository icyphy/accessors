import React from "react";
// react plugin used to create google maps
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";

// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";

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
      defaultZoom={13}
      defaultCenter={{ lat: 40.748817, lng: -73.985428 }}
      defaultOptions={{
        scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
        styles: [
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
      <Marker position={{ lat: 40.748817, lng: -73.985428 }} />
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
              <Col md="12">
                <Card className="card-plain">
                  <CardHeader>Google Maps + {this.state.apiKey}</CardHeader>
                  <CardBody>
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
                      />
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
