import React from 'react';
import ReactDOM from "react-dom";
import Odometer from 'react-odometerjs';

//This component won't display correct icons without these imports,
//because fonts cannot be declared inside a webcomponent.
//If the main UI app uses these same stylesheets and icons, these imports aren't
//strictly necessary but they are included here anyway for portability.
import "assets/css/nucleo-icons.css";
import "assets/scss/black-dashboard-react.scss";

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

class RestaurantComponent extends HTMLElement {

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
                <Card>
                <CardHeader>
                <h5 className="card-category">Restaurant Component</h5>
                </CardHeader>
                <CardBody>

                <img src="../food/burger.jpeg" alt="Tasty Hamburger" height="200" width="301"
                      style={{display: "block", "margin-left": "auto", "margin-right": "auto"}}/>
                  <Card className="card-tasks">

                  <CardHeader>
                    <h3 className="title d-inline">Today's Menu at iCyPhy Kitchen</h3>
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
                          Action
                        </DropdownItem>
                        <DropdownItem
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                        >
                          Another action
                        </DropdownItem>
                        <DropdownItem
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                        >
                          Something else
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </CardHeader>
                  <CardBody style={{"padding": "0px"}}>
                    <div className="table-full-width table-responsive" style={{ "overflow-y": "auto", "overflow-x": "auto" }}>
                      <Table>
                        <tbody>
                          <tr>
                            <td>
                              <p className="title">iCyPhy Burger</p>
                              <p className="text-muted">
                                Free range accessors served with cheese.
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip636901683"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p className="title">Ptolemy's Salad</p>
                              <p className="text-muted">
                                Ancient lettuce with dressing.
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip457194718"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p className="title">Denso Sandwich</p>
                              <p className="text-muted">
                                Drives away with the flavor!
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip362404923"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p className="title">Dessert</p>
                              <p className="text-muted">
                                Not a specific food. Just "dessert".
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip362404923"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p className="title">Not-so-Ice Cream</p>
                              <p className="text-muted">
                                Served at room temperature.
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip362404923"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p className="title">Another Menu Item</p>
                              <p className="text-muted">
                                Another description of tasty food.
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip362404923"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p className="title">Yet Another Menu Item</p>
                              <p className="text-muted">
                                Even more amazing food.
                              </p>
                            </td>
                            <td className="td-actions text-right">
                              <Button
                                color="link"
                                id="tooltip362404923"
                                title=""
                                type="button"
                              >
                                <i className="tim-icons icon-simple-add" />
                              </Button>
                            </td>
                          </tr> 
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                  </Card>
                  <Button
                    block
                    color="primary"
                    onClick={e => e.preventDefault()}
                  >
                    Proceed to Checkout
                  </Button>
                  </CardBody>
                </Card>
            </div>
        ), mountPoint);
  }
}
customElements.define('__componentName__', RestaurantComponent);