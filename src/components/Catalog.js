import React, { Component, useState } from 'react';
import {Container, Tabs, Tab, Accordion, Card, Button, Modal } from 'react-bootstrap';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import  LayoutFlow  from './Lineage';
import { getModel } from '../services/getModel';
import ContentEditable from 'react-contenteditable';
import { useHistory } from 'react-router-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";

export default function Catalog (props) {
  let history = useHistory();
  const [catalogModel, setCatalogModel] = useState({});
  let { path, url } = useRouteMatch();
  function catalogDescription()  {
    if(catalogModel.description) {
      return catalogModel.description;
    } else {
      return null;
    };
  }

  function catalogDependsOn() {
    // console.log("catalogModel.depends_on");
    // console.log(catalogModel.depends_on);

    const ancestorModels = () => {
      if(!catalogModel.depends_on) return null;
      // console.log("found ancestors");
      return catalogModel.depends_on.nodes.map((value,index) => {
        // console.log(value);
        var ancestorClickEvent = (e) => {e.preventDefault(); history.push("/catalog/"+value);};
        return(
          <div key={"catalogDependsOnModel"+index} title={value}>
            {index===0?(<b>Models:<br/></b>):null}
            <a href="#" onClick={ancestorClickEvent}>{value.split(".").pop()}</a>
          </div>
        )
      });
    }
    const ancestorMacros = () => {
      if(!catalogModel.depends_on) return null;
      return catalogModel.depends_on.macros.map((value,index) => {
        return(
          <div key={"catalogDependsOnMacro"+index} title={value}>
            {index===0?(<b>Macros:<br/></b>):null}
            {value.split(".").pop()}
          </div>
        )
      });
    }
    return (
      <>
        {ancestorModels()}
        {ancestorMacros()}
      </>
    )
  }

  function catalogDependencies() {
    // console.log("catalogModel.referenced_by");
    // console.log(catalogModel.referenced_by);

    const dependentModels = () => catalogModel.referenced_by.map((value,index) => {
      var dependentClickEvent = (e) => {e.preventDefault(); history.push("/catalog/"+value);};
      return(
        <div key={"catalogDependentModel"+index} title={value}>
          {index===0?(<b>Models:<br/></b>):null}
          <a href="#" onClick={dependentClickEvent}>{value.split(".").pop()}</a>
        </div>
      )
    });
    return (
      <>
        {dependentModels()}
      </>
    )
  }

  function nodeContributors() {
    // console.log("catalogModel.referenced_by");
    // console.log(catalogModel.referenced_by);

    const nodeContributorMap = () => catalogModel.all_contributors.map((value,index) => {
      return(
        <div key={"nodeContributor"+index} title={value}>
          {index===0?(<b>Contributors:<br/></b>):null}
          {value}
        </div>
      )
    });

    if(catalogModel.all_contributors.length > 1) {
      return (
        <>
          {nodeContributorMap()}
        </>
      )
    } else {
      return null;
    }
    
  }


  function nodeHistory() {
    // console.log("catalogModel.referenced_by");
    // console.log(catalogModel.referenced_by);
    const fileCommits = () => catalogModel.all_commits.map((value,index) => {
      return(
        <tr key={"catalogFileCommit "+index} title={value.hash}>
          <td title={value.authorDate}>
            {value.authorDateRel}
          </td>
          <td>
            {value.authorName}
          </td>
          <td>
            <a href={value.originURL !== null?value.originURL:null} target="_blank">
              {value.subject}
            </a>
          </td>
        </tr>
      )
    });
    return (
      <>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">
                Date
              </th>
              <th scope="col">
                Author
              </th>
              <th scope="col">
                Commit Message
              </th>
            </tr>
          </thead>
          <tbody>
            {fileCommits()}
          </tbody>
        </table>
      </>
    )
  }
  
  

  function catalogColumns() {

    const columnRows = () => {
      return Object.entries(catalogModel.columns).map((value,index) => {
        const testList = (tests) => {
          // console.log(tests);
          return tests.map((key,testIndex) => {
            // console.log(key);
            // console.log(value);
            if(key.type==="relationships") {
              return (
                <div key={"catalogTest"+index+"."+testIndex} className={"test-"+key.severity.toLowerCase()} title={"On fail: "+key.severity}>
                  is found in {key.related_model}.{key.related_field}
                </div>
              )
            }
            return (
              <div key={"catalogTest"+index+"."+testIndex} className={"test-"+key.severity.toLowerCase()} title={"On fail: "+key.severity}>
                {key.type}
              </div>
            )
          })
        }
        return(
          <tr key={"columnRow"+value[0]}>
            <td>
              {value[0].toLowerCase()}
            </td>
            <td>
              {value[1].type.toLowerCase()}
            </td>
            <td>
              
            <ContentEditable
                  html={value[1].description}
                  onBlur={updateMetadataModel}
                  data-metadatafield="ColumnDescription"
                  data-columnName={value[0].toLowerCase()}
                  placeholder={"Add a description"}
                />
            </td>
            <td>
              {testList(value[1].tests)}
            </td>
          </tr>
        );
      });
    }
    if(Object.keys(catalogModel.columns).length > 0) { //if this has columns
      return(
        <div className="row mt-md-3">
          <div className="col">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>
                    Name
                  </th>
                  <th>
                    Type
                  </th>
                  <th>
                    Description
                  </th>
                  <th>
                    Tests
                  </th>
                </tr>
              </thead>
              <tbody>
                {columnRows()}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return(
        <div className="row">
          <div className="col col-md-auto">
            This model does not appear to contain any rows.
          </div>
        </div>
      );
    };
  }

  function updateMetadataModel (e) {
    // console.log("updateMetadataModel");
    // console.log(e);
    // console.log(e.target.dataset.metadatafield);
    // console.log(e.target.innerText);
    // console.log(catalogModel.yaml_path);
    // console.log(catalogModel.model_path);
    var metadataBody = {};
    switch(e.target.dataset.metadatafield) {
      case "Description":
        metadataBody = {
          "updateMethod": "yamlModelProperty",
          "yaml_path": catalogModel.yaml_path,
          "model_path": catalogModel.model_path,
          "model": catalogModel.name,
          "node_id": catalogModel.nodeID,
          "property_name": "description",
          "new_value": e.target.innerText
        }
      break;
      case "Tags":
        if(e.target.innerText === "None") {
          metadataBody = null;
          break;
        }
        metadataBody = {
          "updateMethod": "yamlModelTags",
          "yaml_path": catalogModel.yaml_path,
          "model_path": catalogModel.model_path,
          "model": catalogModel.name,
          "node_id": catalogModel.nodeID,
          "property_name": "tags",
          "new_value": e.target.innerText.split(',').map(function(item) { // Split tags by commas, and remove any spaces if any
              return item.trim();
            })
        }
      break;
      case "ColumnDescription":
        metadataBody = {
          "updateMethod": "yamlModelColumnProperty",
          "yaml_path": catalogModel.yaml_path,
          "model_path": catalogModel.model_path,
          "model": catalogModel.name,
          "node_id": catalogModel.nodeID,
          "column": e.target.dataset.columnname,
          "property_name": "description",
          "new_value": e.target.innerText
        }
      break;
      default:
        // console.log("updateMetadata: no switch case found");
    }
    if(metadataBody) {
      // console.log(this.props.user.token);
      fetch('/api/v1/update_metadata', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + props.user.token,
        },
        body: JSON.stringify(metadataBody)
      });
    }
  }

  function lineageModal(lineage, selectModel) {
    function LineageModal(lineage) {
      const [show, setShow] = useState(false);
    
      const handleClose = () => setShow(false);
      const handleShow = () => setShow(true);
      // console.log("lineageModal");
      // console.log(lineage);
    
      return (
        <>
          <Button variant="primary" onClick={handleShow}>
            Show Lineage
          </Button>
    
          <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>{catalogModel.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="lineagebox">
              <LayoutFlow className="lineagebox" lineageArray={lineage} selectModel={selectModel}/>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
    }
    return <LineageModal lineage={lineage}/>
  }

  function showCreatedBy() {
    if(catalogModel.model_type==="node" && catalogModel.created_by) { 
      return(
        <div className="row mt-md-3">
          <div className="col col-md-auto">
            Created: {catalogModel.created_by + (catalogModel.created_relative_date?", "+catalogModel.created_relative_date:null)} 
          </div>
        </div>
      );
    }
  
  }

  function CatalogPage() {
    let { catalogPage } = useParams();
    // console.log(catalogPage);
    if(Object.keys(catalogModel).length === 0 || catalogModel.nodeID !== catalogPage) {
      getModel(catalogPage, props.user)
        .then(response => {
          // console.log(response)
          if(!response.error) {
            setCatalogModel(response);
          }
        });
      return(<></>);
    }
    const tags = catalogModel.tags.length>0?catalogModel.tags.join(", "):null
    return(
      <Container className="catalogContainer display-block">
        <div className="row justify-content-md-left">
          <div className="col col-md-auto pr-md-3">
            <h3 className="mb-md-0">{catalogModel.name.toLowerCase()}</h3>
          </div>
          <div className="col font-italic align-self-end pl-md-0">
            {catalogModel.materialization}
          </div>
          <div className="col align-self-end pl-md-0 text-right">
            tags: <i>
              <ContentEditable
                innerRef={tags}
                html={tags}
                onBlur={updateMetadataModel}
                data-metadatafield="Tags"
                placeholder={"Add comma-separated Tags"}
                style= {{display: "inline", minWidth: "100px"}}
              />
            </i>
          </div>
        </div>
        <div className="row justify-content-between pt-md-1">
          <div className="col col-md-auto">
            {catalogModel.database.toLowerCase()}.{catalogModel.schema.toLowerCase()}.{catalogModel.name.toLowerCase()}
          </div>
          <div className="col col-md-auto">
            {catalogModel.row_count?Number(catalogModel.row_count).toLocaleString()+" rows":null}
          </div>
        </div>
        {showCreatedBy()}
        <div className="row mt-md-3">
          <div className="col col-md-auto">
            <ContentEditable
              innerRef={catalogModel.description}
              html={catalogDescription()}
              onBlur={updateMetadataModel}
              data-metadatafield="Description"
              placeholder={"Add a description"}
            />
          </div>
        </div>
        <div className="row mt-md-3">
          <div className="col col-md-auto">
            {lineageModal(catalogModel.lineage, props.selectModel)}
          </div>
        </div>
        <Accordion className="mt-md-3" defaultActiveKey="0">
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="0">
                Columns
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <div className="container">
                {catalogColumns()}
              </div>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="1">
                SQL
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1">
              <div className="container">
                <div className="row mt-md-3 mb-md-3">
                  <div className="col col-md-auto">
                    <Tabs defaultActiveKey="raw" id="uncontrolled-tab-example" className="ml-md-1">
                      <Tab eventKey="raw" title="raw SQL" className="py-md-3 catalogSQL">
                        {catalogModel.raw_sql}
                      </Tab>
                      <Tab eventKey="processed" title="processed SQL" className="py-md-3 catalogSQL">
                        {catalogModel.compiled_sql}
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="2">
                Code Change History
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="2">
              <div className="container">
                <div className="row mt-md-3 mb-md-3">
                  <div className="col col-md-auto">
                    {nodeContributors()}
                  </div>
                </div>
                <div className="row mt-md-3 mb-md-3">
                  <div className="col col-md-auto">
                    {nodeHistory()}
                  </div>
                </div>
              </div>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="3">
                Depends On
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="3">
              <div className="container">
                <div className="row mt-md-3 mb-md-3">
                  <div className="col col-md-auto">
                    {catalogDependsOn()}
                  </div>
                </div>
              </div>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="4">
                Dependencies
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="4">
              <div className="container">
                <div className="row mt-md-3 mb-md-3">
                  <div className="col col-md-auto">
                    {catalogDependencies()}
                  </div>
                </div>
              </div>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </Container>
    )
  }
  


    return (
      <Switch>
        <Route exact path = {path}>
          <div>
            Welcome to the Catalog. Search in the bar above to find models.
          </div>
        </Route>
        <Route path={`${path}/:catalogPage`}>
          <CatalogPage/>
        </Route>
      </Switch>
        
          
    );
}
