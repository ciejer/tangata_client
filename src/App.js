import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";
import {Collapse, Container, Row, Col } from 'react-bootstrap';
import { io } from "socket.io-client";
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import Login from './components/Login';
import Config from './components/Config';
import ModelBuilder from './components/ModelBuilder';
import { NavBar } from './components/NavBar';
import Catalog from './components/Catalog';
import { getSSH } from "./services/getSSH";
import { getUserConfig } from "./services/getUserConfig";
import { getGenerateSSH } from "./services/getGenerateSSH";
import { getOpenGit } from "./services/getOpenGit";
import { getCheckDBTConnection } from "./services/getCheckDBTConnection";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.modelBuilder = React.createRef();
    var hostVersion = '';
    var tempUser = {};
    if(window.location.port === '8080') { // python version
      // console.log('python')
      hostVersion = 'python'
      tempUser = {"token":""}
    } else {
      // console.log('node')
      hostVersion = 'node'
      if(sessionStorage.getItem("user")) {
        getUserConfig(JSON.parse(sessionStorage.getItem("user")).user)
        .then(response => {
          this.setState({"userConfig": response.user})
        });
        tempUser = JSON.parse(sessionStorage.getItem("user")).user;
        
      }
    }
    document.title = 'Tāngata';
    this.state = {
      appState: "Catalog",
      "hostVersion": hostVersion,
      modelBuilder: {
        "models": [{"name": "humans"},{"name":"abductions"}],
        "logState": false,
        "openSQLPanel": false,
        "addModel": {}
      },
      contextMenuOpen: false,
      catalogModel: {},
      sshKey: "",
      user: tempUser,
      userConfig: {},
      userMessages: []
    };
  }
  
  

  handleAllClicks = (e) => {
    // console.log("handleAllClicks");
    if(this.state.contextMenuOpen===true) {
      this.setState({contextMenuOpen: false});
    }
  };

  // addModelToModelBuilder = (nodeId) => {

  //   this.setState({modelBuilder: {...this.state.modelBuilder, "addModel": 
  // }

  // selectModel = (nodeId) => {
  //   // console.log("selectModel");
  //   // console.log(nodeId);
  //   getModel(nodeId, this.state.user)
  //     .then(response => {
  //       // console.log(response)
  //       if(!response.error) {
  //         if(this.state.appState === "Catalog") {
  //           this.setState({"catalogModel":response})
  //         }
  //       }
        
  //     });
  // }

  openContextMenu = (openState) => {
    // console.log("openContextMenu");
    if(openState===true) {
      this.setState({contextMenuOpen: true});
    } else {
      this.setState({contextMenuOpen: false});
    }
  }

  logState = () => {
    this.setState({"logState": true})
  }
  openSQLPanel = () => {
    this.setState({"openSQLPanel": true})
  }

  addModel = () => {
    // console.log("Not yet implemented"); //TODO: add input model from catalog
  }

  openModelBuilder = () => {
    this.setState({"appState": "ModelBuilder"})
  }

  openCatalog = () => {
    this.setState({"appState": "Catalog"})
  }

  openConfig = () => {
    this.setState({"appState": "Config"})
  }

  componentDidUpdate() {
    if(this.state.logState === true) {
      console.log("App State:");
      console.log(this.state);
      this.setState({"logState": false})
    }
    if(this.state.openSQLPanel === true) this.setState({"openSQLPanel": false});
  }
  // componentDidMount() {
  //   if(window.location.port === '8080') { // python version
  //     console.log('python')
  //     this.setState({"hostVersion": "python"})
  //   } else {
  //     console.log('node')
  //     this.setState({"hostVersion": "node"})
  //   }
  //   if(Object.keys(this.state.user).length === 0) {
  //     if(sessionStorage.getItem("user")) {
  //       getUserConfig(JSON.parse(sessionStorage.getItem("user")).user)
  //       .then(response => {
  //         this.setUserConfig(response.user);
  //       });
  //       this.setUser(JSON.parse(sessionStorage.getItem("user")))
  //     }
      
  //   }
  //   document.title = 'Tāngata';
  // }

  setUser = (newUser) => {
    // console.log("setUser");
    this.setState({"user": newUser.user})
  }
  setUserConfig = (newUserConfig) => {
    this.setState({"userConfig": newUserConfig})
  }

  setSSHKey = () => {
    getSSH(this.state.user)
    .then(response=> response.text())
    .then(responseText => {
      // console.log(responseText);
      this.setState({"sshKey": responseText});
    });
  }

  generateSSHKey = () => {
    getGenerateSSH(this.state.user)
    .then(response=> response.text())
    .then(responseText => {
      this.setState({"sshKey": responseText});
    });
  }

  openGitConnection = () => {
    getOpenGit(this.state.user)
    .then(response=> response.text())
    .then(responseText => {
      return responseText;
    });
  }
  checkDBTConnection = () => {
    getCheckDBTConnection(this.state.user)
    .then(response=> {
      // console.log(response);
      if(response.ok === true) {
        // console.log("Success");
        toast.success("DBT_ Connection Successful.");
      } else {
        response.text()
        .then(responseText=> {
          // console.log(response);
          // console.log(responseText);
          toast.error("DBT_ Connection Failed: " + responseText, {
            autoClose: 10000,
            });
          // toast(response);
        });
      }
    });
  }

  toastSender = (message, toastType) => {
    if(toastType === "error") {
      toast.error(message);
    } else if (toastType === "success") {
      toast.success(message);
    } else {
      toast(message);
    }
  }
  
  clearUserMessages = () => {
    this.setState({"userMessages": []})
  } 

  LoginRoute = ({ children, ...rest }) => {
    // console.log(this.state.hostVersion);
    // console.log(Object.keys(this.state.user).length)
    // console.log(rest);
    return (
      <Route
        {...rest}
        render={({ location }) =>
          (this.state.hostVersion === 'python' || Object.keys(this.state.user).length > 0) ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login"
              }}
            />
          )
        }
      />
    );
  }
  
  render() {
    // console.log(window.location)
    // console.log(window.location.port)
    var socket = null
    socket = io({
      auth: (cb) => {
        cb({
          token: this.state.user
        });
      }
    });
    socket.on("connect", () => {
      // either with send()
      socket.send("Hello!");
    });
    socket.on("toast", (data) => {
      // console.log("Toast received");
      this.toastSender(data.message, data.type);
    });

    return (
      <Router>
        <div id="main">
          <Switch>
            <Route exact path="/">
              <Redirect to="/catalog"/>
            </Route>
            <Route path="/login">
              <Login
                setUser={this.setUser}
                setUserConfig={this.setUserConfig}
                user={this.state.user}
                appState={this.state.appState}
              />
            </Route>
            <this.LoginRoute path="/catalog">
              <NavBar
                addModel={this.addModel}
                hostVersion={this.state.hostVersion}
                logState={this.logState}
                openSQLPanel={this.openSQLPanel}
                openModelBuilder={this.openModelBuilder}
                openCatalog={this.openCatalog}
                openConfig={this.openConfig}
                appState={this.state.appState}
                openContextMenu={this.openContextMenu}
                contextMenuOpen={this.state.contextMenuOpen}
                selectModel={this.selectModel}
                user={this.state.user}
                setUser={this.setUser}
                userConfig={this.state.userConfig}
                setUserConfig={this.setUserConfig}
              />
              <div className="body">
                <Catalog
                  appState={this.state.appState}
                  catalogModel={this.state.catalogModel}
                  selectModel={this.selectModel}
                  user={this.state.user}
                  hostVersion={this.state.hostVersion}
                />
              </div>
            </this.LoginRoute>
            <this.LoginRoute path="/config">
              <NavBar
                addModel={this.addModel}
                logState={this.logState}
                openSQLPanel={this.openSQLPanel}
                openModelBuilder={this.openModelBuilder}
                openCatalog={this.openCatalog}
                openConfig={this.openConfig}
                appState={this.state.appState}
                openContextMenu={this.openContextMenu}
                contextMenuOpen={this.state.contextMenuOpen}
                selectModel={this.selectModel}
                user={this.state.user}
                setUser={this.setUser}
                userConfig={this.state.userConfig}
                setUserConfig={this.setUserConfig}
              />
              <div className="body">
                <Config
                  appState={this.state.appState}
                  user={this.state.user}
                  userConfig={this.state.userConfig}
                  setUserConfig={this.setUserConfig}
                  sshKey={this.state.sshKey}
                  setSSHKey={this.setSSHKey}
                  generateSSHKey={this.generateSSHKey}
                  openGitConnection={this.openGitConnection}
                  checkDBTConnection={this.checkDBTConnection}
                  toastSender={this.toastSender}
                />
              </div>
            </this.LoginRoute>
          </Switch>
          <ToastContainer
            position="bottom-center"
            autoClose={8000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    );
  }
}

export default App;
