import {Button, Form, Tabs, Tab, TabContainer } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { postUserConfig } from "../services/postUserConfig";
import { postServerConfig } from "../services/postServerConfig";
import { postFileUpload } from "../services/postFileUpload";
import { refreshMetadata } from "../services/refreshMetadata";
import { getDBTCloudAccounts } from "../services/getDBTCloudAccounts";
import { getDBTCloudJobs } from "../services/getDBTCloudJobs";
export default function Config(props) {
  const [copySuccess, setCopySuccess] = useState('');
  const [dbtMethod, setdbtMethod] = useState('LiveDB');
  const [dbtAccounts, setdbtAccounts] = useState({});
  const [dbtDocsJobs, setdbtDocsJobs] = useState({});
  const sshKeyRef = useRef(null);
  const dbtCloudKey = useRef(null);
  const dbtAccountRef = useRef(null);
  const dbtJobRef = useRef(null);
  
  function copyToClipboard(e) {
    sshKeyRef.current.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
    e.target.focus();
    setCopySuccess('Copied!');
  };


  // console.log(props.userConfig);
  console.log(props.serverConfig);

  function updateConfigValue(newValue, updatedField) {
    var newConfig = {...props.userConfig};
    newConfig[updatedField] = newValue;
    props.setUserConfig(newConfig);
    postUserConfig(props.user, newConfig);
  }
  
  function updateServerConfigValue(newValue, updatedField) {
    var newServerConfig = {...props.serverConfig};
    newServerConfig[updatedField] = newValue;
    props.setServerConfig(newServerConfig);
    postServerConfig(props.user, newServerConfig);
  }

  function uploadFile(uploadedFiles, uploadType) {
    // console.log(uploadedFiles[0]);
    if(uploadedFiles.length>0) {
      const uploadData = new FormData();
      uploadData.append('file', uploadedFiles[0]);
      postFileUpload(uploadData, uploadType, props.user)
      .then(response=> {
        // console.log(response);
        if(response.ok === true) {
          // console.log("Success");
          props.toastSender("" + uploadType + " Upload Successful.","success");
        } else {
          response.text()
          .then(responseText=> {
            // console.log(response);
            // console.log(responseText);
            props.toastSender("" + uploadType + " Upload Failed: \n" + responseText,"error");
          });
        }
      });
    }
  }

  function updateDBTCloudKey(newKey) {
    if(newKey.length>0) {
      const uploadData = new FormData();
      var keyFile = new Blob([newKey], {type: 'text/plain'});
        uploadData.append('file', keyFile);
        postFileUpload(uploadData, 'dbt_ Cloud Key', props.user)
        .then(response=> {
          // console.log(response);
          if(response.ok === true) {
            // console.log("Success");
            props.toastSender("dbt_ Cloud Key Upload Successful.","success");
          } else {
            response.text()
            .then(responseText=> {
              // console.log(response);
              // console.log(responseText);
              props.toastSender("dbt_ Cloud Key Upload Failed: \n" + responseText,"error");
            });
          }
        });
    }
  }

  function updateDBTCloudConfig() { //doing it manually rather than updateConfigValue because it's two at once - saving one without the other breaks existing config
    var newConfig = {...props.userConfig};
    newConfig["dbt_cloud_account"] = dbtAccountRef.current.value;
    newConfig["dbt_cloud_job"] = dbtJobRef.current.value;
    postUserConfig(props.user, newConfig);
    props.setUserConfig(newConfig);
  }

  function loadDBTAccounts() {
    getDBTCloudAccounts(props.user)
    .then(response=> response.json())
    .then(returnedDBTCloudAccounts => {
      // console.log(returnedDBTCloudAccounts);
      setdbtAccounts(returnedDBTCloudAccounts);
      selectAccount();
    })
  }

  function selectAccount() {
    // console.log("Account Selected")
    // console.log(dbtAccountRef.current.value);
    getDBTCloudJobs(props.user, dbtAccountRef.current.value)
    .then(response=> response.json())
    .then(returnedDBTCloudJobs => {
      // console.log(returnedDBTCloudJobs);
      setdbtDocsJobs(returnedDBTCloudJobs);
    });
  }

  function listDBTDocsJobs() {
    // console.log(dbtDocsJobs);
    return dbtDocsJobs.map((job, index) => {return(<option key={"dbt job "+index} value={job.id}>{job.id}: {job.name}</option>)})
  }
  function dbtDocsJobsSelect() {
    if(dbtDocsJobs.length > 0) {
      return(
        <>
          <Form.Group size="lg" controlId="dbt_cloud_jobs">
            <Form.Label>dbt_ Cloud Jobs</Form.Label>
            <Form.Control
              autoFocus
              as="select"
              custom
              ref={dbtJobRef}
            >
              {listDBTDocsJobs()}
            </Form.Control>
          </Form.Group>
          <Button
            variant="primary"
            className="m-1"
            onClick={(e) => {e.stopPropagation(); updateDBTCloudConfig();}}
          >
            Save
          </Button>
        </>
      );
    } else return null;
  }

  function listDBTAccounts() {
    return dbtAccounts.map((account, index) => {return(<option key={"dbt account "+index} value={account.id}>{account.id}: {account.name}</option>)})
  }
  function dbtAccountsSelect() {
    if(dbtAccounts.length > 0) {
      return(
        <Form.Group size="lg" controlId="dbt_cloud_accounts">
          <Form.Label>dbt_ Cloud Accounts</Form.Label>
          <Form.Control
            autoFocus
            as="select"
            custom
            ref={dbtAccountRef}
            onChange={e => selectAccount()}
          >
            {listDBTAccounts()}
          </Form.Control>
        </Form.Group>);
    } else return null;
  }

  return (
    <div className="container mt-3">
      <h1>Config</h1>
      <Tabs defaultActiveKey={props.hostVersion === 'python' ? "modelPromotion" : "userdetails"} id="config">
        <Tab eventKey="userdetails" title="User Details" className="border-right border-left border-bottom p-3" tabClassName={props.hostVersion === 'python' ? 'd-none' : ''}>
          <Form>
            {/* <Form.Group size="lg" controlId="loginEmail"> //let's not change email addresses for now.
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={props.user.email}
                onChange={(e) => updateConfigValue(e.target.value, "email")}
              />
            </Form.Group> */}
            <Form.Group size="lg" controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={props.userConfig.firstname}
                onChange={(e) => updateConfigValue(e.target.value, "firstname")}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={props.userConfig.lastname}
                onChange={(e) => updateConfigValue(e.target.value, "lastname")}
              />
            </Form.Group>
          </Form>
        </Tab>
        <Tab eventKey="gitConfig" title="Git Config" className="border-right border-left border-bottom p-3" tabClassName={props.hostVersion === 'python' ? 'd-none' : ''}>
          <Form>
            <Form.Group size="lg" controlId="gitSSHKey">
              <Form.Label>SSH Key</Form.Label>
              <br/>
              <Button
                variant="primary"
                onClick={(e) => {e.stopPropagation(); props.setSSHKey()}}
                className="m-1"
              >
                Get current SSH public key
              </Button>
              <Button
                variant="warning"
                className="m-1"
                onClick={(e) => {
                  e.stopPropagation();
                  let checkIntent = prompt("This will delete any current SSH keys. Please type 'New Key' to continue");
                  if(checkIntent === "New Key") {
                    props.generateSSHKey()
                  }
                }}
              >
                Create new SSH Key
              </Button>
              <Form.Control
                autoFocus
                as="textarea"
                rows={2}
                value={props.sshKey}
                ref={sshKeyRef}
                // onChange={(e) => setEmail(e.target.value)}
              />
              {
              /* Logical shortcut for only displaying the 
                  button if the copy command exists */
              document.queryCommandSupported('copy') &&
                <div>
                  <Button variant="primary" onClick={copyToClipboard} className="m-1">Copy</Button> 
                  {copySuccess}
                </div>
              }
              <Form.Text id="gitSSHHelpBlock" muted>
                Where to add your key:<br/>
                <a href="https://github.com/settings/ssh/new">GitHub SSH Keys - Add New</a><br/>
                <a href="https://gitlab.com/profile/keys">GitLab SSH Keys - Add an SSH key</a><br/>
              </Form.Text>
            </Form.Group>
            <Form.Group size="lg" controlId="gitrepo">
              <Form.Label>Git SSH URL</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={props.userConfig.gitrepo || ''}
                onChange={(e) => updateConfigValue(e.target.value, "gitrepo")}
              />
              <Form.Text id="gitSSHHelpBlock" muted>
                Examples:<br/>
                git@github.com:yourname/yourproject.git<br/>
                git@gitlab.com:yourname/yourproject.git
              </Form.Text>
            </Form.Group>
              <Button
                variant="primary"
                className="m-1"
                onClick={(e) => {e.stopPropagation(); props.openGitConnection()}}
              >
                Clone Git Repository
              </Button>
          </Form>
        </Tab>
        <Tab eventKey="dbtConfig" title="DBT Config" className="border-right border-left border-bottom p-3" tabClassName={props.hostVersion === 'python' ? 'd-none' : ''}>
          <Form>
            <Form.Group size="lg" controlId="dbtConfigMethod">
              <Form.Label>dbt_ Config Method</Form.Label>
              <div key={'custom-inline-radio'} className="mb-3">
                <Form.Check
                  custom
                  inline
                  label="Live Database Connection"
                  type='radio'
                  id={'LiveDB'}
                  checked={props.userConfig.dbtmethod==="LiveDB"}
                  onClick={(e) => {e.stopPropagation(); updateConfigValue("LiveDB", "dbtmethod")}}
                />
                <Form.Check
                  custom
                  inline
                  label="Upload Compiled Metadata"
                  type='radio'
                  id={'UploadMetadata'}
                  checked={props.userConfig.dbtmethod==="UploadMetadata"}
                  onClick={(e) => {e.stopPropagation(); updateConfigValue("UploadMetadata", "dbtmethod")}}
                />
                <Form.Check
                  custom
                  inline
                  label="dbt_ Cloud API"
                  type='radio'
                  id={'Cloud'}
                  checked={props.userConfig.dbtmethod==="Cloud"}
                  onClick={(e) => {e.stopPropagation(); updateConfigValue("Cloud", "dbtmethod")}}
                />
              </div>
            </Form.Group>
            <hr/>
            <div className={props.userConfig.dbtmethod==="LiveDB"?null:"d-none"}>
              <Form.Group size="lg" controlId="uploadProfilesYML">
                <Form.Label>Upload Profiles.YML</Form.Label>
                <Form.File
                  className="position-relative"
                  required
                  name="profilesYMLUpload"
                  onChange={(e) => uploadFile(e.target.files, "ProfilesYML") }
                  // isInvalid={!!errors.file}
                  // feedback={errors.file}
                  id="profilesYMLUpload"
                  feedbackTooltip
                />
                <Form.Text id="profilesYMLHelpBlock" muted>
                  To connect to your database, DBT requires a profiles.yml file. See <a href="https://docs.getdbt.com/dbt-cli/configure-your-profile">the dbt_ docs</a> for setup details.
                </Form.Text>
              </Form.Group>
              <Button
                variant="primary"
                className="m-1"
                onClick={(e) => {e.stopPropagation(); props.checkDBTConnection()}}
              >
                Check DBT Connection
              </Button>
            </div>
            <div className={props.userConfig.dbtmethod==="UploadMetadata"?null:"d-none"}>
              <p><i>To run without connecting to your database, the catalog requires metadata from dbt_.<br/>
              Run <code>dbt docs generate</code> in your dbt_ project, and upload the Manifest and Catalog from /target.</i></p>
              <p><i>To automate this upload, download <code>tangata_refresh.py</code> from the Tangata git repository, and run it in the root of your project.</i></p> 
              <Form.Group size="lg" controlId="uploadManifestJSON">
                <Form.Label>Upload manifest.json</Form.Label>
                <Form.File
                  className="position-relative"
                  required
                  name="manifestJSONUpload"
                  onChange={(e) => uploadFile(e.target.files, "ManifestJSON") }
                  // isInvalid={!!errors.file}
                  // feedback={errors.file}
                  id="manifestJSONUpload"
                  feedbackTooltip
                />
              </Form.Group>
              <Form.Group size="lg" controlId="uploadCatalogJSON">
                <Form.Label>Upload catalog.json</Form.Label>
                <Form.File
                  className="position-relative"
                  required
                  name="catalogJSONUpload"
                  onChange={(e) => uploadFile(e.target.files, "CatalogJSON") }
                  // isInvalid={!!errors.file}
                  // feedback={errors.file}
                  id="catalogJSONUpload"
                  feedbackTooltip
                />
              </Form.Group>
              <Button
                variant="primary"
                className="m-1"
                onClick={(e) => {e.stopPropagation(); refreshMetadata(props.user);}}
              >
                Load Metadata
              </Button>
            </div>
            <div className={props.userConfig.dbtmethod==="Cloud"?null:"d-none"}>
              <Form.Group size="lg" controlId="firstname">
                <Form.Label>dbt_ Cloud API Key</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  placeholder="Change dbt_ Cloud Key"
                  ref={dbtCloudKey}
                />
              </Form.Group>
              <Button
                variant="primary"
                className="m-1"
                onClick={(e) => {e.stopPropagation(); updateDBTCloudKey(dbtCloudKey.current.value); loadDBTAccounts();}}
              >Load dbt_ Cloud Accounts</Button>
              {dbtAccountsSelect()}
              {dbtDocsJobsSelect()}
            </div>
          </Form>
        </Tab>
        <Tab eventKey="modelPromotion" title="Model Promotion" className="border-right border-left border-bottom p-3" tabClassName={props.hostVersion !== 'python' ? 'd-none' : ''}>
        {/* TODO: Add Node config for this */}
          <Form>
            <Form.Group size="lg" controlId="promotion_tag">
              <Form.Label>Promotion Tag</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                defaultValue={props.serverConfig.promotion_tag}
                onChange={(e) => updateServerConfigValue(e.target.value, "promotion_tag")}
              />
              <Form.Text id="promotionTagHelpBlock" muted>
                This tag will be used in your dbt repository for models you promote in Tāngata. These models will be highlighted in search.
              </Form.Text>
            </Form.Group>
            <Form.Group size="lg" controlId="demotion_tag">
              <Form.Label>Demotion Tag</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                defaultValue={props.serverConfig.demotion_tag}
                onChange={(e) => updateServerConfigValue(e.target.value, "demotion_tag")}
              />
              <Form.Text id="demotionTagHelpBlock" muted>
                This tag will be used in your dbt repository for models you demote in Tāngata. These models will be dimmed in search, and will appear after other results.
              </Form.Text>
            </Form.Group>
          </Form>
        </Tab>
        <Tab eventKey="yamlConfig" title="YAML Config" className="border-right border-left border-bottom p-3" tabClassName={props.hostVersion !== 'python' ? 'd-none' : ''}>
        {/* TODO: Add Node config for this */}
          <Form>
            <Form.Group size="lg" controlId="newYAMLNaming">
              <Form.Label>New YAML file behaviour</Form.Label>
              <div key={'custom-inline-radio'} className="mb-3">
                <Form.Check
                  custom
                  inline
                  label="One YAML per folder, named foldername.yml"
                  type='radio'
                  id={'file_per_folder__folder_name'}
                  checked={props.serverConfig.schema_file_settings==="file_per_folder__folder_name"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("file_per_folder__folder_name", "schema_file_settings")}}
                />
                <Form.Check
                  custom
                  inline
                  label="One YAML per folder, named schema.yml"
                  type='radio'
                  id={'file_per_folder__schema_yml'}
                  checked={props.serverConfig.schema_file_settings==="file_per_folder__schema_yml"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("file_per_folder__schema_yml", "schema_file_settings")}}
                />
                <Form.Check
                  custom
                  inline
                  label="One YAML per model, named modelname.yml"
                  type='radio'
                  id={'file_per_model__model_name'}
                  checked={props.serverConfig.schema_file_settings==="file_per_model__model_name"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("file_per_model__model_name", "schema_file_settings")}}
                />
              </div>
            </Form.Group>
            <Form.Group size="lg" controlId="plusForTags">
              <Form.Label>Use + as tags prefix in dbt_project.yml</Form.Label>
              <div key={'custom-inline-radio'} className="mb-3">
                <Form.Check
                  custom
                  inline
                  label="Use '+tags' in dbt_project.yml"
                  type='radio'
                  id={'plus_for_tags'}
                  checked={props.serverConfig.use_plus_for_tags==="true"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("true", "use_plus_for_tags")}}
                />
                <Form.Check
                  custom
                  inline
                  label="Use 'tags' in dbt_project.yml"
                  type='radio'
                  id={'no_plus_for_tags'}
                  checked={props.serverConfig.use_plus_for_tags==="false"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("false", "use_plus_for_tags")}}
                />
              </div>
            </Form.Group>
            <Form.Group size="lg" controlId="reorderSchemaYml">
              <Form.Label>Reorder all yml files alphabetically</Form.Label>
              <div key={'custom-inline-radio'} className="mb-3">
                <Form.Check
                  custom
                  inline
                  label="Order schema.yml, sources.yml and dbt_project.yml models alphabetically"
                  type='radio'
                  id={'reorder_yml'}
                  checked={props.serverConfig.order_schema_yml_by_name==="true"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("true", "order_schema_yml_by_name")}}
                />
                <Form.Check
                  custom
                  inline
                  label="Add new records to the bottom, wherever they are"
                  type='radio'
                  id={'leave_yml_order_in_place'}
                  checked={props.serverConfig.order_schema_yml_by_name==="false"}
                  onClick={(e) => {e.stopPropagation(); updateServerConfigValue("false", "order_schema_yml_by_name")}}
                />
              </div>
            </Form.Group>
          </Form>
        </Tab>
        {/* <Tab eventKey="password" title="Change Password" className="border-right border-left border-bottom p-3">
        <Form>
            <Form.Group size="lg" controlId="loginPassword">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                // onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                // onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="repeatNewPassword">
              <Form.Label>Repeat New Password</Form.Label>
              <Form.Control
                type="password"
                // onChange={(e) => setPassword(e.target.value)}
              />`
            </Form.Group>
          </Form>
        </Tab> */}
      </Tabs>
    </div>
  );
}