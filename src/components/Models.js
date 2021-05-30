import React, {useState} from 'react';
// import Draggable from 'react-draggable';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { EditJoinPanel } from './EditJoinPanel'
import { Container, Overlay, Table } from 'react-bootstrap';


export function Models ({models, modelDragEnd, showColumns, saveEditedModel, toggleJoinModal, showJoinModal, highlightedColumns, openContextMenu, contextMenuOpen, editSelect}) {
    const [contextMenu, setContextMenu] = useState({"x":null,"y":null,"display":false});
    // console.log("Models");
    // console.log(contextMenuOpen);
    // console.log(contextMenuOpen);
    // console.log(models);
    // console.log(highlightedColumns);
    if (models.length === 0) return null
      
    if(contextMenuOpen === false && contextMenu.display===true) { //add this to every other component that has context menus
        setContextMenu({"x":null,"y":null,"display":false});
      }

      const contextMenuDisplay = (contextMenu, models) => {
        if(contextMenu.display === false) return null;
        // console.log("Displaying Context Menu");
        // console.log(contextMenu);
    
        // console.log(contextMenu.target.firstChild.data);
        // console.log(contextMenu.target);
        // console.log(JSON.parse(contextMenu.target.dataset.selectvalue));
        // console.log(contextMenu.target.dataset.selectvalue.model);
        const addToSelect = (selectToAdd) => {
          editSelect(null,selectToAdd);
          openContextMenu(false);
        };
        return(
          <div>
            <Overlay target={contextMenu.target} show={contextMenu.display} placement="right-start">
              <div>
                <Table bordered variant="dark">
                  <tbody>
                    <tr>
                      <td onClick={() => addToSelect({"inputColumns": [{"model": contextMenu.target.parentNode.dataset.model, "column": contextMenu.target.parentNode.dataset.column}], "alias": contextMenu.target.parentNode.dataset.column})}>
                        Add to Output
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Overlay>
          </div>
        )
      }


    const modelDraw = (model,index,showColumns, showJoinModal, toggleJoinModal, highlightedColumns, handleClick) => {
        const columnRows = (columns,showColumns) => {
            const columnRow = (column,index) => {
                const handleClick = (e) => {
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
                }
                // console.log("modelDraw");
                // console.log(model);
                // console.log(column);
                var highlightThisColumn = false;
                for(var highlightedColumnIndex=0;highlightedColumnIndex<highlightedColumns.length;highlightedColumnIndex++) {
                    if(model.name===highlightedColumns[highlightedColumnIndex].model && column===highlightedColumns[highlightedColumnIndex].column) {
                        highlightThisColumn = true;
                    }
                }
                return(
                    <tr
                        key = {index}
                        className={index%2 === 0?'odd':'even'}
                        onClick={(e) => handleClick(e)}
                        onContextMenu={(e) => handleClick(e)}
                        data-model = {model.name}
                        data-column = {column}
                    >
                        <td
                            className={"col-md-auto "+(highlightThisColumn?"highlightColumn":null)}
                        >
                            {index + 1}
                        </td>
                        <td
                            className={"col "+(highlightThisColumn?"highlightColumn":null)}
                        >
                            {column}
                        </td>
                    </tr>
                );
            }
            
            const columnRowsOutput = columns.map((column,index) => columnRow(column,index));
            return(<tbody>{columnRowsOutput}</tbody>);
        }
        return(
        <Draggable key={"model_"+model.name} draggableId={model.name} index={index}>
        {(provided, snapshot) => (
            <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="col removeFocusOutline"
            >
            <div className="w-100 bg-secondary text-white text-center font-weight-bold">
                {model.name}
            </div>
            <div className="w-100 bg-light text-dark text-center font-italic mb-3">
                {model.description}
            </div>
            <div className="w-100 bg-light text-dark text-center">
                <EditJoinPanel
                    model = { model }
                    saveEditedModel = { saveEditedModel }
                    models = { models }
                    showJoinModal = { showJoinModal }
                    toggleJoinModal = { toggleJoinModal }
                    modelIndex = { index }
                />
            </div>
            <table className="table table-bordered table-striped table-hover w-100">
                    {showColumns===true ? columnRows(model.columns) : null}
            </table>
            </div>
        )}
        </Draggable>)
    }
    const modelsDraw = (models,showColumns, showJoinModal, toggleJoinModal) => 
        models.response.models.map((model,index) => {
            return modelDraw(model,index,showColumns, showJoinModal, toggleJoinModal, highlightedColumns)
        }
        );
    
    

    const ModelTable = () => {

        return(
            <div className="container">
                

                <DragDropContext onDragEnd={modelDragEnd}> 
                {/* TODO: only allow reordering models if they are all models
                TODO: only allow two models in a join */}
                    <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        >
                        {modelsDraw(models,showColumns, showJoinModal, toggleJoinModal, highlightedColumns)}
                        {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                </DragDropContext>

            </div>
        )
    }

    return(
        <div className="text-center">
            <h2>Models</h2>
            {ModelTable()}
            {contextMenuDisplay(contextMenu, models)}
        </div>
    )
}
