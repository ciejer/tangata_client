import React from 'react'

const JsonFilenameInput = ({ onChangeForm, getModelJson, user }) => {
      //Login might not work, this is not in use. Added user in so I remember, but can't test
      return (
        <form onSubmit={(e) => {e.preventDefault(); getModelJson(e, user)}} > 
          <label>
            Name:
            </label>
            <input type="text" name="jsonFilename" id="jsonFilename" defaultValue="all_models.json" onChange= {(e) => onChangeForm(e)} />
          
          <input type="button" onClick= {(e) => getModelJson(e, user)}  value="Get File"></input>
        </form>
      );
  }
export default JsonFilenameInput
