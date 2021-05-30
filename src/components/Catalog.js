import React, { Component, useState } from 'react';
import {Container, Tabs, Tab, Accordion, Card, Button, Modal } from 'react-bootstrap';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import  LayoutFlow  from './Lineage';
import ContentEditable from 'react-contenteditable'

class Catalog extends Component {

  catalogDescription = () => {
    if(this.props.catalogModel.description) {
      return this.props.catalogModel.description;
    } else {
      return null;
    };
  }

  catalogDependsOn = () => {
    // console.log("this.props.catalogModel.depends_on");
    // console.log(this.props.catalogModel.depends_on);

    const ancestorModels = () => {
      if(!this.props.catalogModel.depends_on) return null;
      // console.log("found ancestors");
      return this.props.catalogModel.depends_on.nodes.map((value,index) => {
        // console.log(value);
        var ancestorClickEvent = (e) => {e.preventDefault(); this.props.selectModel(value);};
        return(
          <div key={"catalogDependsOnModel"+index} title={value}>
            {index===0?(<b>Models:<br/></b>):null}
            <a href="#" onClick={ancestorClickEvent}>{value.split(".").pop()}</a>
          </div>
        )
      });
    }
    const ancestorMacros = () => {
      if(!this.props.catalogModel.depends_on) return null;
      return this.props.catalogModel.depends_on.macros.map((value,index) => {
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

  catalogDependencies = () => {
    // console.log("this.props.catalogModel.referenced_by");
    // console.log(this.props.catalogModel.referenced_by);

    const dependentModels = () => this.props.catalogModel.referenced_by.map((value,index) => {
      var dependentClickEvent = (e) => {e.preventDefault(); this.props.selectModel(value);};
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

  nodeContributors = () => {
    // console.log("this.props.catalogModel.referenced_by");
    // console.log(this.props.catalogModel.referenced_by);

    const nodeContributorMap = () => this.props.catalogModel.all_contributors.map((value,index) => {
      return(
        <div key={"nodeContributor"+index} title={value}>
          {index===0?(<b>Contributors:<br/></b>):null}
          {value}
        </div>
      )
    });

    if(this.props.catalogModel.all_contributors.length > 1) {
      return (
        <>
          {nodeContributorMap()}
        </>
      )
    } else {
      return null;
    }
    
  }


  nodeHistory = () => {
    // console.log("this.props.catalogModel.referenced_by");
    // console.log(this.props.catalogModel.referenced_by);
    var gitRepo = null;
      if(this.props.userConfig.dbtmethod === "LiveDB") {
        let gitExtract = this.props.userConfig.gitrepo.match(/[^@]+@(github.com|gitlab.com):([^.]+).git/);
        // console.log(gitExtract);
        gitRepo = "http://"+gitExtract[1]+"/"+gitExtract[2]+"/";
        // console.log(gitRepo);
      }
    const fileCommits = () => this.props.catalogModel.all_commits.map((value,index) => {
      var gitLink = null;
      if(gitRepo !== null) {
        gitLink = gitRepo + 'commit/' + value.hash;
        // console.log(gitLink);
      }
      return(
        <tr key={"catalogFileCommit "+index} title={value.hash}>
          <td title={value.authorDate}>
            {value.authorDateRel}
          </td>
          <td>
            {value.authorName}
          </td>
          <td>
            <a href={this.gitLink !== null?gitLink:null} target="_blank">
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
  
  

  catalogColumns = () => {

    const columnRows = () => {
      return Object.entries(this.props.catalogModel.columns).map((value,index) => {
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
                  onBlur={this.updateMetadataModel}
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
    if(Object.keys(this.props.catalogModel.columns).length > 0) { //if this has columns
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

  updateMetadataModel = (e) => {
    // console.log("updateMetadataModel");
    // console.log(e);
    // console.log(e.target.dataset.metadatafield);
    // console.log(e.target.innerText);
    // console.log(this.props.catalogModel.yaml_path);
    // console.log(this.props.catalogModel.model_path);
    var metadataBody = {};
    switch(e.target.dataset.metadatafield) {
      case "Description":
        metadataBody = {
          "updateMethod": "yamlModelProperty",
          "yaml_path": this.props.catalogModel.yaml_path,
          "model_path": this.props.catalogModel.model_path,
          "model": this.props.catalogModel.name,
          "node_id": this.props.catalogModel.nodeID,
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
          "yaml_path": this.props.catalogModel.yaml_path,
          "model_path": this.props.catalogModel.model_path,
          "model": this.props.catalogModel.name,
          "node_id": this.props.catalogModel.nodeID,
          "property_name": "tags",
          "new_value": e.target.innerText.split(',').map(function(item) { // Split tags by commas, and remove any spaces if any
              return item.trim();
            })
        }
      break;
      case "ColumnDescription":
        metadataBody = {
          "updateMethod": "yamlModelColumnProperty",
          "yaml_path": this.props.catalogModel.yaml_path,
          "model_path": this.props.catalogModel.model_path,
          "model": this.props.catalogModel.name,
          "node_id": this.props.catalogModel.nodeID,
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
          'Authorization': 'Token ' + this.props.user.token,
        },
        body: JSON.stringify(metadataBody)
      });
    }
  }

  lineageModal = (lineage, selectModel) => {
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
              <Modal.Title>Modal heading</Modal.Title>
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

  showCreatedBy = () => {
    if(this.props.catalogModel.model_type==="node" && this.props.catalogModel.created_by) { 
      return(
        <div className="row mt-md-3">
          <div className="col col-md-auto">
            Created: {this.props.catalogModel.created_by + (this.props.catalogModel.created_relative_date?", "+this.props.catalogModel.created_relative_date:null)} 
          </div>
        </div>
      );
    }
  
  }

  render() {
    if(this.props.appState !== "Catalog") return null;
    if(Object.keys(this.props.catalogModel).length === 0) { //Default catalog screen
      return (
        <div>
          Welcome to the Catalog. Search in the bar above to find models.
        </div>
      );
    } else {
      const tags = this.props.catalogModel.tags.length>0?this.props.catalogModel.tags.join(", "):null
      return (
          <Container className="catalogContainer display-block">
            <div className="row justify-content-md-left">
              <div className="col col-md-auto pr-md-3">
                <h3 className="mb-md-0">{this.props.catalogModel.name.toLowerCase()}</h3>
              </div>
              <div className="col font-italic align-self-end pl-md-0">
                {this.props.catalogModel.materialization}
              </div>
              <div className="col align-self-end pl-md-0 text-right">
                tags: <i>
                  <ContentEditable
                    innerRef={this.tags}
                    html={tags}
                    onBlur={this.updateMetadataModel}
                    data-metadatafield="Tags"
                    placeholder={"Add comma-separated Tags"}
                    style= {{display: "inline", minWidth: "100px"}}
                  />
                </i>
              </div>
            </div>
            <div className="row justify-content-between pt-md-1">
              <div className="col col-md-auto">
                {this.props.catalogModel.database.toLowerCase()}.{this.props.catalogModel.schema.toLowerCase()}.{this.props.catalogModel.name.toLowerCase()}
              </div>
              <div className="col col-md-auto">
                {this.props.catalogModel.row_count?Number(this.props.catalogModel.row_count).toLocaleString()+" rows":null}
              </div>
            </div>
            {this.showCreatedBy()}
            <div className="row mt-md-3">
              <div className="col col-md-auto">
                <ContentEditable
                  innerRef={this.description}
                  html={this.catalogDescription()}
                  onBlur={this.updateMetadataModel}
                  data-metadatafield="Description"
                  placeholder={"Add a description"}
                />
              </div>
            </div>
            <div className="row mt-md-3">
              <div className="col col-md-auto">
                {this.lineageModal(this.props.catalogModel.lineage, this.props.selectModel)}
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
                    {this.catalogColumns()}
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
                            {this.props.catalogModel.raw_sql}
                          </Tab>
                          <Tab eventKey="processed" title="processed SQL" className="py-md-3 catalogSQL">
                            {this.props.catalogModel.compiled_sql}
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
                        {this.nodeContributors()}
                      </div>
                    </div>
                    <div className="row mt-md-3 mb-md-3">
                      <div className="col col-md-auto">
                        {this.nodeHistory()}
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
                        {this.catalogDependsOn()}
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
                        {this.catalogDependencies()}
                      </div>
                    </div>
                  </div>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Container>
            
      );
    }
  }
}

export default Catalog;
