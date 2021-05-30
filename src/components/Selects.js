import React, {useState} from 'react';
import { Container, Overlay, Table, Form } from 'react-bootstrap';



export function Selects( {models, openContextMenu, contextMenuOpen, selects, editSelect, highlightColumn, outputModel, editOutputModel}) {
    const [contextMenu, setContextMenu] = useState({"x":null,"y":null,"display":false});
    const [editingField, setEditingField] = useState(-1);
    const [editingDescription, setEditingDescription] = useState(-1);
    // console.log("Selects:")
    // console.log(models);
    // console.log(selects);
    // console.log(contextMenu);
    // console.log(clicked);
    // console.log(editingField);
    if (models.length === 0) return null

    if(contextMenuOpen === false && contextMenu.display===true) { //add this to every other component that has context menus
        setContextMenu({"x":null,"y":null,"display":false});
      }

    const contextMenuDisplay = (contextMenu, selects) => {
        if(contextMenu.display === false) return null;
        // console.log("Displaying Context Menu");
        // console.log(contextMenu);
        // console.log(contextMenu.target.firstChild.data);
        // console.log(contextMenu.target);
        // console.log(contextMenu.target.dataset.selectindex);
        const clickEditSelectName = (selectToEdit) => {
        //   setEditConditionMenu({"show": true, "conditionToEdit":contextMenu.target.firstChild.data});
          setEditingField(parseInt(selectToEdit));
          openContextMenu(false);
        };
        const clickEditSelectDescription = (selectToEdit) => {
        //   setEditConditionMenu({"show": true, "conditionToEdit":contextMenu.target.firstChild.data});
          // console.log("clickEditSelectDescription");
          // console.log(selectToEdit);
          setEditingDescription(parseInt(selectToEdit));
          openContextMenu(false);
        };
        const clickRemoveSelect = (selectToRemove) => {
          editSelect(selectToRemove,null);
          openContextMenu(false);
        };
        return(
          <div>
            <Overlay target={contextMenu.target} show={contextMenu.display} placement="left-start">
              <div>
                <Table bordered variant="dark">
                  <tbody>
                    <tr>
                      <td onClick={() => clickEditSelectName(contextMenu.target.dataset.selectindex)}>
                        <div>Edit Name</div>
                      </td>
                    </tr>
                    <tr>
                      <td onClick={() => clickEditSelectDescription(contextMenu.target.dataset.selectindex)}>
                        <div>Edit Description</div>
                      </td>
                    </tr>
                    <tr>
                      <td onClick={() => clickRemoveSelect(selects[contextMenu.target.dataset.selectindex])}>
                        Delete Field
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Overlay>
          </div>
        )
      }
    
    
    const listModelColumns = (models,selects, highlightColumn,openContextMenu) => {
        
        const handleClick = (e) => {
            // console.log("handleClick");
            // console.log(e);
              if (e.type === 'click') {
                setContextMenu({"x":null,"y":null,"display":false});
                openContextMenu(false);
              } else if (e.type === 'contextmenu') {
                e.preventDefault();
                if(contextMenu.display===false) { //if contextMenu is not displayed
                  setContextMenu({"x":e.pageX,"y":e.pageY,"display":true,"clickTargetType":"Condition","target": e.target});
                  openContextMenu(true);
                } else {
                  setContextMenu({"x":null,"y":null,"display":false});
                  openContextMenu(false);
                }
              }
          };

          const updateColumnAlias = (e) => {
            //   console.log("updateColumnAlias");
            //   console.log(e);
              e.preventDefault();
              setEditingField(-1);
              editSelect(selects[editingField],{...selects[editingField], "alias": e.target.value});
          };
          const updateColumnDescription = (e) => {
              // console.log("updateColumnDescription");
              // console.log(e);
              e.preventDefault();
              setEditingDescription(-1);
              editSelect(selects[editingDescription],{...selects[editingDescription], "description": e.target.value});
          };

          const showField = (selects, selectsIndex) => {
            //   console.log("showField");
            //   console.log(selectsIndex);
            //   console.log(editingField);
            if(editingField === selectsIndex) {
                return(
                    <>
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    defaultValue={(selects[selectsIndex].alias !== null && selects[selectsIndex].alias !== undefined)?selects[selectsIndex].alias:selects[selectsIndex].column}
                                    onBlur={(e) => updateColumnAlias(e)}
                                    placeholder="Add name for output field"
                                    autoFocus
                                />
                            </Form.Group>
                        </Form>
                    </>
                );
            } else {
                return(
                    <>
                        <div className="w-100 text-dark text-right" data-selectindex = {selectsIndex}>
                          {(selects[selectsIndex].alias !== null && selects[selectsIndex].alias !== undefined)?selects[selectsIndex].alias:selects[selectsIndex].column}
                        </div>
                    </>
                );
            }
          };
        const showDescription = (selects, selectsIndex) => {
          // console.log(selects);
          // console.log(selectsIndex);
          // console.log(editingDescription);
          if(editingDescription === selectsIndex) { //if decription is being edited
            return(
                <>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                defaultValue={(selects[selectsIndex].description !== null && selects[selectsIndex].description !== undefined)?selects[selectsIndex].description:null}
                                onBlur={(e) => updateColumnDescription(e)}
                                placeholder="Add description for output field"
                                autoFocus
                            />
                        </Form.Group>
                    </Form>
                </>
            );
        } else if(selects[selectsIndex].description !== null && selects[selectsIndex].description !== undefined) { // if description is defined
            return(
                <>
                    <div className="w-100 text-dark text-right font-italic" data-selectindex = {selectsIndex}>
                      {selects[selectsIndex].description}
                    </div>
                </>
            );
        } else return null;
      };
        

        const highlightColumns = (col) => {
            // console.log("highlightColumns");
            // console.log(col);
            var tempColumnsToHighlight = [];
            if(col !== undefined & col !== null) {
                for(var columnIndex=0;columnIndex<col.inputColumns.length;columnIndex++) {
                    tempColumnsToHighlight.push(col.inputColumns[columnIndex]);
                } 
            }
            highlightColumn(tempColumnsToHighlight);
        };
        var tempListModelColumns = [];
        for(let selectsIndex=0;selectsIndex<selects.length;selectsIndex++) {
            // console.log("selectsMap");
            // console.log(selects[selectsIndex]);
            tempListModelColumns.push(
                <tr
                    key={selectsIndex}
                    onMouseEnter={() => highlightColumns(selects[selectsIndex])}
                    onMouseLeave={() => highlightColumns()}
                    onClick={(e) => handleClick(e)}
                    onContextMenu={(e) => handleClick(e)}
                >
                    <td
                    data-selectindex = {selectsIndex}
                    >
                        {showField(selects, selectsIndex)}
                        {showDescription(selects, selectsIndex)}
                    </td>
                </tr>
            );
        };
        return tempListModelColumns;
    };

    return(
        <div>
            <h2 className="text-center">
                Output
            </h2>
            <div className="w-100 bg-secondary text-white text-center">{outputModel.name}</div>
            <div className="w-100 bg-light text-dark text-center font-italic mb-3">
                {outputModel.description?outputModel.description:"New Model"}
            </div>
            <table className="table table-striped table-hover w-100">
                <tbody>
                    {listModelColumns(models,selects, highlightColumn,openContextMenu)}
                </tbody>
            </table>
            {contextMenuDisplay(contextMenu, selects)}
        </div>
    )
}