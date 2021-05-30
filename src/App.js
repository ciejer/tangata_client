import React, { Component } from 'react';
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
import { getModel } from './services/getModel';
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
  }
  state = {
    appState: "Catalog",
    modelBuilder: {
      "models": [{"name": "humans"},{"name":"abductions"}],
      "logState": false,
      "openSQLPanel": false,
      "addModel": {}
    },
    contextMenuOpen: false,
    catalogModel: {},
    sshKey: "",
    user: {},
    userConfig: {},
    userMessages: []
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

  selectModel = (nodeId) => {
    // console.log("selectModel");
    // console.log(nodeId);
    getModel(nodeId, this.state.user)
      .then(response => {
        // console.log(response)
        if(!response.error) {
          if(this.state.appState === "Catalog") {
            this.setState({"catalogModel":response})
          }
        }
        
      });
  }

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
  componentDidMount() {
    if(window.location.port === '8080') { // python version
      console.log('python')
      this.setState({"hostVersion": "python"})
    } else {
      console.log('node')
      this.setState({"hostVersion": "node"})
    }
    if(Object.keys(this.state.user).length === 0) {
      if(sessionStorage.getItem("user")) {
        getUserConfig(JSON.parse(sessionStorage.getItem("user")).user)
        .then(response => {
          this.setUserConfig(response.user);
        });
        this.setUser(JSON.parse(sessionStorage.getItem("user")))
      }
      
    }
    document.title = 'Tāngata';
  }

  setUser = (newUser) => {
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
  
  render() {
    console.log(window.location.port)
    if(this.state.hostVersion !== 'python' && Object.keys(this.state.user).length === 0) {
      return (
        <div id="main">
          <Login
            setUser={this.setUser}
            setUserConfig={this.setUserConfig}
          />
        </div>
      )
    } else {
      var socket = null
      // if(this.state.hostVersion !== 'python') { // TODO: remove python filter from sockets. It's crowding my console.
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
    // }
  
      
      return (
        <div id="main" onClick={this.handleAllClicks} onContextMenu={this.handleAllClicks}>
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
            {/* <ModelBuilder
              modelBuilder={this.state.modelBuilder}
              ref={this.modelBuilder}
              logState={this.state.logState}
              openSQLPanel={this.state.openSQLPanel}
              appState={this.state.appState}
              openContextMenu={this.openContextMenu}
              contextMenuOpen={this.state.contextMenuOpen}
              user={this.state.user}
            /> */}
            <Catalog
              appState={this.state.appState}
              catalogModel={this.state.catalogModel}
              selectModel={this.selectModel}
              user={this.state.user}
              userConfig={this.state.userConfig}
            />
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
          </div>
      );
    }
  }
}

export default App;
