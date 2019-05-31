/*eslint-disable*/
import React from "react";
// used for making the prop types of this component
import PropTypes from "prop-types";

// reactstrap components
import { Container, Row, Nav, NavItem, NavLink, Button } from "reactstrap";

import {Redirect } from 'react-router'

var ws;

function reset(){
  console.log("**********&&&&&&&&&&*************")
  var resetMessage = {
        "id" : "system",
        "msg" : "reset"
      }
  console.log("Sending reset message to controller.");
  ws.send(JSON.stringify(resetMessage));

  //FIXME: I'm leaving it like this to save time for the conference, but
  //a better way of ensuring the controller has had time to get itself ready for
  //the redirect is for the controller to handshake with a new message 
  //back to this websocket to say it's ready for the redirect.
  setTimeout(  () => this.setState({redirectToDashboard: true}), 1000);
}

//This variable changes value every time the reset button is pressed
//to indicate to the dashboard a new press has occurred.
var resetToggle = false;

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToDashboard: false
    };
    ws = new WebSocket('ws://' + window.location.hostname  + ':8095/');
  }


//<Redirect to="/admin/dashboard"/>

  render() {

    if(this.state.redirectToDashboard){
        console.log("Rendering redirect to /admin/dashboard");
        this.setState({redirectToDashboard : false});
        resetToggle = !resetToggle;
        return (
          <Redirect to={{
            pathname: "/admin/dashboard",
            state: {resetToggle : resetToggle}
          }}/>
          )
    } else {
      if(this.props.resetFooter){
        return (
          <footer className="footer">

            <Container fluid>
                    <Button className="btn-fill" color="primary" type="submit"
                    onClick={reset.bind(this)}
                    >
                      Reset
                    </Button>
                  {/* 
                                  <div className="console">
                  <label id="log">
                  </label>
                </div>

                  */}


              {/*
              <Nav>
                <NavItem>
                  <NavLink href="javascript:void(0)">Creative Tim</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="javascript:void(0)">About Us</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="javascript:void(0)">Blog</NavLink>
                </NavItem>
              </Nav>
              <div className="copyright">
                © {new Date().getFullYear()} made with{" "}
                <i className="tim-icons icon-heart-2" /> by{" "}
                <a
                  href="javascript:void(0)"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Creative Tim
                </a>{" "}
                for a better web.
              </div>
            }
            */}
            </Container>
          </footer>
        );
      } else {
        return (
          <footer className="footer">
          </footer>
        );
      }

    }

    
  }
}

export default Footer;
