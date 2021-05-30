import React, { useRef, useState } from 'react';
import { Overlay, Popover, Navbar, Nav } from 'react-bootstrap'; 
import { getModelSearch } from '../services/getModelSearch';
const reactState = process.env.NODE_ENV;
export const NavBar = ({addModel, logState, openSQLPanel, openModelBuilder, openCatalog, openConfig, appState, contextMenuOpen, openContextMenu, selectModel, user, setUser, userConfig, setUserConfig}) => {
    const [searchDropdown, setSearchDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const debugLogState = (reactState) => {
        if ( reactState === 'development') {
            return(
                <div className="nav-item nav-link" role="button" onClick={() => logState()}>Show state in console </div>
                );
        } else return null;
    }
    const searchBox = useRef(null);

    if(contextMenuOpen === false && searchDropdown===true) { //add this to every other component that has context menus
        setSearchDropdown(false);
      }


    const selectSearchResult = (e,index) => {
        // console.log("clickResult");
        // console.log(index);
        openContextMenu(false);
        setSearchDropdown(false);
        e.stopPropagation();
        selectModel(searchResults[index].nodeID);
        openCatalog();
    }

    const toggleSearchDropdown = (newValue) => {
        
        setSearchDropdown(newValue);
        openContextMenu(newValue);
    }

    const preventSearchClicks = (e) => {
        if(e.target.value.length>0) {
            e.stopPropagation();
            openContextMenu(true);
        }
    }

    const searchRow = (searchResult, index) => {
        // console.log("searchRow")
        // console.log(searchResult);
        const columnDetails = () => {
            if(searchResult.type==="column_name" || searchResult.type==="column_description") {
                return(
                    <div className="row">
                        <div className="col">
                            Column: {searchResult.columnName}
                        </div>
                        <div className="col">
                            {searchResult.columnDescription}
                        </div>
                    </div>
                );
            } else return null;
        }
        const tagDetails = () => {
            if(searchResult.type==="tag_name") {
                return(
                    <div className="row">
                        <div className="col">
                            Tag: {searchResult.tagName}
                        </div>
                    </div>
                );
            } else return null;
        }
        
        return (
            <div className="row" key={"searchRow"+index}>
                <div className="col-sm">
                    <div className="container border-top border-bottom" onClick={(e) => selectSearchResult(e, index)}>
                        <div className="row">
                            <div className="col font-weight-bold">
                                {searchResult.modelName.toLowerCase()}
                            </div>
                            <div className="col font-weight-light font-italic text-right">
                                {searchResult.nodeID.toLowerCase()}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col font-italic">
                                {searchResult.modelDescription}
                            </div>
                        </div>
                        {columnDetails()}
                        {tagDetails()}
                    </div>
                </div>
            </div>
        );
    }    
    
    const getSearchResults = (e) => {
        // console.log("getSearchResults");
        if(e.target.value.trim().length===0) {
            setSearchResults([]);
            return null;
        };
        openContextMenu(true);
        setSearchDropdown(true);
        getModelSearch(searchBox.current.value, user)
            .then(response => {
                // console.log(response);
                if(response.length===0 || response.error) {
                    setSearchResults([]);
                    return null;
                }
                if(response.searchString === searchBox.current.value) {
                    const allSearchRows = response.results.slice(0,15);
                    setSearchResults(allSearchRows);
                }
                // console.log("getSearchResults");
                // console.log(allSearchRows);
            });
        
    }

    const allSearchRows = () => {
        if(searchResults.length===0 || !searchDropdown) return null;
        
        const allSearchRows = searchResults.map((searchResult, index) => searchRow(searchResult, index));
        const actionText = appState==="Catalog"?"open in Catalog":"add to Model Builder"
        return(
            <Overlay target={searchBox} show={searchDropdown} placement="bottom">
                <div className="container bg-light searchbox-width z-200">
                    <div className="row">
                        <div className="col-sm font-weight-bold font-italic">
                            Select model to {actionText}:
                        </div>
                    </div>
                    {allSearchRows}
                </div>
            </Overlay>
        );
        
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

    return(
    <Navbar className="navbar-dark bg-brand position-fixed w-100 z-100" expand="lg">
        <Navbar.Brand href="/">TĀNGATA</Navbar.Brand>
        {/* <a className="navbar-brand bg-brand" href="/">TANGATA</a> */}
        <Navbar.Toggle aria-controls="navbarContent"/>
        <Navbar.Collapse id="navbarContent" className="justify-content-between">
            <div className="navbar-nav p-2 bg-brand">
                <div className={"nav-item nav-link bg-brand "+(appState==="Catalog"?"active":null)} role="button" onClick={() => openCatalog()}>Catalog</div>
                <div className={"nav-item nav-link bg-brand "+(appState==="Config"?"active":null)} role="button" onClick={() => openConfig()}>Config</div>
            </div>
            <div className="navbar-nav p2">
                <form className="form-inline">
                    <input className="form-control mr-sm-2" type="search" ref={searchBox} onClick={(e) => preventSearchClicks(e)} onChange={(e) => getSearchResults(e)} onFocus={() => toggleSearchDropdown(true)} placeholder="Search Models" aria-label="Search Models"/>
                </form>
                {allSearchRows()}
            </div>
            <div className="navbar-nav p-2">
                <div className={"nav-item nav-link mr-sm-2"+(userConfig.dbtmethod!=="UploadMetadata"?null:" d-none")} role="button" onClick={() => reloadDBT()}>Refresh dbt_ catalog</div>
                <div className="nav-item nav-link mr-sm-2" role="button" onClick={() => createPR()}>Submit changes</div>
                {/* <div className="nav-item nav-link mr-sm-2" role="button" onClick={() => openSQLPanel()}>Open SQL Panel </div> */}
                {debugLogState(reactState)}
                <div className="nav-item nav-link mr-sm-2" role="button" onClick={() => logout()}>Logout {userConfig.firstname}</div>
            {/* <a class="nav-item nav-link active" href="#">Home <span class="sr-only">(current)</span></a>
            <a class="nav-item nav-link" href="#">Features</a>
            <a class="nav-item nav-link" href="#">Pricing</a>
            <a class="nav-item nav-link disabled" href="#">Disabled</a> */}
            </div>
        </Navbar.Collapse>
    </Navbar>
    )
}

