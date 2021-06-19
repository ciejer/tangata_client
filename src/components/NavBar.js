import React, { useRef, useState } from 'react';
import { Overlay, Popover, Navbar, Nav } from 'react-bootstrap'; 
import { useHistory } from 'react-router-dom';
const reactState = process.env.NODE_ENV;
export const NavBar = ({addModel, hostVersion, logState, openSQLPanel, openModelBuilder, openCatalog, openConfig, appState, contextMenuOpen, openContextMenu, selectModel, user, setUser, userConfig, setUserConfig}) => {
    let history = useHistory();
    const debugLogState = (reactState) => {
        if ( reactState === 'development') {
            return(
                <div className="nav-item nav-link" role="button" onClick={() => logState()}>Show state in console </div>
                );
        } else return null;
    }
    const logoutButton = (hostVersion, userConfig) => {
        if ( hostVersion === 'node') {
            return(
                <div className="nav-item nav-link mr-sm-2" role="button" onClick={() => logout()}>Logout {userConfig.firstname}</div>
                );
        } else return null;
    }
    const submitChanges = (hostVersion, createPR) => {
        if ( hostVersion === 'node') {
            return(
                <div className="nav-item nav-link mr-sm-2" role="button" onClick={() => createPR()}>Submit changes</div>
                );
        } else return null;
    }
    const config = (hostVersion, createPR) => {
        if ( hostVersion === 'node') {
            return(
                <div className={"nav-item nav-link bg-brand "+(history.location.pathname.includes("/config")?"active":null)} role="button" onClick={() => history.push("/config")}>Config</div>
                );
        } else return null;
    }

    const searchBox = useRef(null);

    function debounceSearchResults(){
      var timeout = 500;
      let timer;
      clearTimeout(timer);
      timer = setTimeout(() => { history.push("/catalog/search/"+searchBox.current.value); }, timeout);
    }

    const getSearchResults = (e) => {
        // console.log("getSearchResults");
        if(e.target.value.trim().length===0) {
            return null;
        };
        debounceSearchResults();
        return null;
    };

    const toggleSearch = () => {
        history.push("/catalog/search/"+searchBox.current.value);
    }

    const reloadDBT = () => {
        fetch('/api/v1/reload_dbt', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + user.token,
          }
        });
    }

    const createPR = () => {
        var prTitle = prompt("Please describe your changes:", "Added descriptions to models x, y");
        // console.log(prTitle);
        var prRequestBody = {
            "prTitle": prTitle
        }
        fetch('/api/v1/create_pr', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + user.token,
          },
          body: JSON.stringify(prRequestBody)
        });
    }

    const logout = () => {
        fetch('/api/v1/users/logout', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + user.token,
          },
        });
        setUser({"user":{}});
        sessionStorage.removeItem("user");
        setUserConfig({});
        sessionStorage.removeItem("userconfig");
    }
    // console.log(history);
    return(
    <Navbar className="navbar-dark bg-brand position-fixed w-100 z-100" expand="lg">
        <Navbar.Brand href="/">TĀNGATA</Navbar.Brand>
        {/* <a className="navbar-brand bg-brand" href="/">TANGATA</a> */}
        <Navbar.Toggle aria-controls="navbarContent"/>
        <Navbar.Collapse id="navbarContent" className="justify-content-between">
            <div className="navbar-nav p-2 bg-brand">
                <div className={"nav-item nav-link bg-brand "+(history.location.pathname.includes("/catalog")?"active":null)} role="button" onClick={() => history.push("/catalog")}>Catalog</div>
                {config(hostVersion, userConfig)}
            </div>
            <div className="navbar-nav p2">
                <form className="form-inline">
                    <input className="form-control mr-sm-2" type="search" ref={searchBox} onFocus={() => toggleSearch()} onChange={(e) => getSearchResults(e)} placeholder="Search Models" aria-label="Search Models"/>
                </form>
            </div>
            <div className="navbar-nav p-2">
                <div className={"nav-item nav-link mr-sm-2"+(userConfig.dbtmethod!=="UploadMetadata"?null:" d-none")} role="button" onClick={() => reloadDBT()}>Refresh dbt_ catalog</div>
                {submitChanges(hostVersion, createPR)}
                {/* <div className="nav-item nav-link mr-sm-2" role="button" onClick={() => openSQLPanel()}>Open SQL Panel </div> */}
                {debugLogState(reactState)}
                {logoutButton(hostVersion, userConfig)}
            {/* <a class="nav-item nav-link active" href="#">Home <span class="sr-only">(current)</span></a>
            <a class="nav-item nav-link" href="#">Features</a>
            <a class="nav-item nav-link" href="#">Pricing</a>
            <a class="nav-item nav-link disabled" href="#">Disabled</a> */}
            </div>
        </Navbar.Collapse>
    </Navbar>
    )
}

