import React, { Component, useState, useEffect } from 'react';
import {Container, Collapse, Row, Col, Tabs, Tab, Accordion, Card, Button, Modal, Overlay, Table } from 'react-bootstrap';
import { Drawer, } from 'react-bootstrap-drawer';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-drawer/lib/style.css';
import  LayoutFlow  from './Lineage';
import { getModel } from '../services/getModel';
import { getModelTree } from '../services/getModelTree';
import ContentEditable from 'react-contenteditable';
import JSONTree from 'react-json-tree'
import Select from 'react-select'
import chroma from 'chroma-js';
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
  const [modelTree, setModelTree] = useState({});
  let { path, url } = useRouteMatch();
  function catalogDescription()  {
    if(catalogModel.description) {
      return catalogModel.description;
    } else {
      return null;
    };
  }
  useEffect(() => {
    getModelTree(props.user)
      .then(response => {
        if(!response.error) {
          setModelTree(response);
        }
      })
  }, []);

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
        const options = [
          { value: 'not_null', label: 'Not Null', "column": value[1].name, "color": "#FF0000"},
          { value: 'unique', label: 'Unique', "column": value[1].name, "color": "#FF0000"},
          // { value: 'relationships', label: 'Relationship', "column": value[1].name}
        ]

        const colourStyles = {
          control: styles => ({ ...styles, backgroundColor: 'white' }),
          option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const color = chroma(data.color);
            return {
              ...styles,
              backgroundColor: isDisabled
                ? null
                : isSelected
                ? data.color
                : isFocused
                ? color.alpha(0.1).css()
                : null,
              color: isDisabled
                ? '#ccc'
                : isSelected
                ? chroma.contrast(color, 'white') > 2
                  ? 'white'
                  : 'black'
                : data.color,
              cursor: isDisabled ? 'not-allowed' : 'default',
        
              ':active': {
                ...styles[':active'],
                backgroundColor:
                  !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
              },
            };
          },
          multiValue: (styles, { data }) => {
            const color = chroma(data.color);
            return {
              ...styles,
              backgroundColor: color.alpha(0.1).css(),
            };
          },
          multiValueLabel: (styles, { data }) => ({
            ...styles,
            color: data.color,
          }),
          multiValueRemove: (styles, { data }) => ({
            ...styles,
            color: data.color,
            ':hover': {
              backgroundColor: data.color,
              color: 'white',
            },
          }),
        };

        function formatTests(tests) {
          var currentTests = []
          for(var thisTest in tests) {
            var testSeverityColor = "#000000";
            var testType = "";
            var testLabel = "";
            if(value[1].tests[thisTest].severity === "ERROR") {
              testSeverityColor = "#FF0000";
            } else if(value[1].tests[thisTest].severity === "WARNING") {
              testSeverityColor = "#FFFF00";
            }
            if(value[1].tests[thisTest].type === "relationships") {
              testType = "relationships";
              testLabel = (<span title={value[1].tests[thisTest].related_model + "." + value[1].tests[thisTest].related_field}>Relationship</span>);
            } else if(value[1].tests[thisTest].type === "not_null") {
              testType = "not_null";
              testLabel = "Not Null";
            } else if(value[1].tests[thisTest].type === "unique") {
              testType = "unique";
              testLabel = "Unique";
            }
            currentTests.push({"value": testType, "label": testLabel, "color": testSeverityColor})
          }
        return currentTests;
        }

        function testChanged(testValue, testAction) {
          // console.log(testValue);
          // console.log(testAction);
          // console.log(value);
          // console.log(catalogModel);
          var allTests = []
          if(testAction.action === "select-option") {
            var newTest = {};
            if(testAction.option.value === "unique" || testAction.option.value === "not_null") {
              // TODO: push test to column.tests
              newTest = {"type": testAction.option.value, "severity": "ERROR"};
              allTests.push(testAction.option.value)
            } else if(testAction.option.value === "relationships") {
              // TODO: push test to column.tests
              
              // allTests.push({[testAction.option.value]: {
              //   "to": "ref('" + newTest.related_model + "')",
              //   "field": newTest.related_field
              // }});
            }
            setCatalogModel({
              ...catalogModel,
              columns: {
                ...catalogModel.columns,
                [testAction.option.column]: {
                  ...catalogModel.columns[testAction.option.column],
                  tests: [
                    ...catalogModel.columns[testAction.option.column].tests,
                    newTest
                  ]
                },
              }
            })
            for(var thisTest in catalogModel.columns[value[0]].tests) { //add existing tests to allTests
              if(catalogModel.columns[value[0]].tests[thisTest].type === "relationships") {
                allTests.push({[catalogModel.columns[value[0]].tests[thisTest].type]: {
                  "to": "ref('" + catalogModel.columns[value[0]].tests[thisTest].related_model + "')",
                  "field": catalogModel.columns[value[0]].tests[thisTest].related_field}})
              } else {
                allTests.push(catalogModel.columns[value[0]].tests[thisTest].type)
              } 
            }
          } else if(testAction.action === "remove-value") {
            let removeItemIndex = catalogModel.columns[value[0]].tests.indexOf(testAction.removedValue.value);
            var newTests = [
              ...catalogModel.columns[value[0]].tests.slice(0,removeItemIndex), ...catalogModel.columns[value[0]].tests.slice(0,removeItemIndex+1)
            ];
            setCatalogModel({
              ...catalogModel,
              columns: {
                ...catalogModel.columns,
                [value[0]]: {
                  ...catalogModel.columns[value[0]],
                  tests: newTests
                },
              }
            })
            for(var thisTest in newTests) { //add existing tests to allTests
              if(newTests[thisTest].type === "relationships") {
                allTests.push({[newTests[thisTest].type]: {
                  "to": "ref('" + newTests[thisTest].related_model + "')",
                  "field": newTests[thisTest].related_field}})
              } else {
                allTests.push(newTests[thisTest].type)
              } 
            }
          }
          updateMetadataModel({
            "column": value[0],
            "tests": allTests,
            "target": {"dataset": {"metadatafield": "ColumnTest"}}
          });
        };
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
            <td style={{width:"230px"}}>
              <Select 
                options={options}
                value={formatTests(catalogModel.columns[value[0]].tests)}
                isMulti
                onChange={testChanged}
                styles={colourStyles}
                menuPortalTarget={document.body}
              />
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
      case "ColumnTest":
        metadataBody = {
          "updateMethod": "yamlModelColumnTest",
          "yaml_path": catalogModel.yaml_path,
          "model_path": catalogModel.model_path,
          "model": catalogModel.name,
          "node_id": catalogModel.nodeID,
          "column": e.column,
          "new_value": e.tests
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
              <LayoutFlow className="lineagebox" lineageArray={lineage}/>
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
  
  const NavigationDrawer = (props) => {
    const [open, setOpen] = useState(false);
  
    const handleToggle = () => setOpen(!open);

    const theme = {
      scheme: 'google',
      author: 'seth wright (http://sethawright.com)',
      base00: '#1d1f21',
      base01: '#282a2e',
      base02: '#373b41',
      base03: '#000000', //#000000
      base04: '#b4b7b4',
      base05: '#c5c8c6',
      base06: '#e0e0e0',
      base07: '#ffffff',
      base08: '#CC342B',
      base09: '#F96A38',
      base0A: '#FBA922',
      base0B: '#198844',
      base0C: '#3971ED',
      base0D: '#3971ED',
      base0E: '#A36AC7',
      base0F: '#3971ED'
    };

    var treeModelClick = (e) => {
      console.log(e);
      e.preventDefault(); 

      history.push("/catalog/"+e.target.dataset.fullnodeid);
    };
  
    return (
      <Drawer { ...props }>
        <Drawer.Toggle onClick={ handleToggle } />
  
        <Collapse in={ open }>
          <Drawer.Overflow>
              <Drawer.Nav>
                <JSONTree 
                  data={modelTree} 
                  theme={theme} 
                  labelRenderer={
                    ([key, keyP1, keyP2, keyP3, keyP4, keyP5, keyP6, keyP7, keyP8]) => {
                      let linkVal = ""
                      if(keyP8) linkVal += keyP8 + "."
                      if(keyP7) linkVal += keyP7 + "."
                      if(keyP6) linkVal += keyP6 + "."
                      if(keyP5) linkVal += keyP5 + "."
                      if(keyP4) linkVal += keyP4 + "."
                      if(keyP3) linkVal += keyP3 + "."
                      if(keyP2) linkVal += keyP2 + "."
                      if(keyP1) linkVal += keyP1 + "."
                      if(key) linkVal += key
                      return(<a href="#" onClick={treeModelClick} data-fullnodeid={linkVal}>{key}</a>)
                    }
                  }
                  shouldExpandNode={() => {return true}}
                  hideRoot = {true}

                />
              </Drawer.Nav>
          </Drawer.Overflow>
        </Collapse>
      </Drawer>
    );
  };

    return (
      <Container fluid>
        <Row className="flex-xl-nowrap">
          <Col as={ NavigationDrawer } xs={ 12 } md={ 4 } lg={ 3 } />
          <Col>
            <Switch>
              <Route exact path = {path}>
                
              </Route>
              <Route path={`${path}/:catalogPage`}>
                <CatalogPage/>
              </Route>
            </Switch>
          </Col>
        </Row>
      </Container>
    );
}
