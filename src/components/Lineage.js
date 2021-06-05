/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { Overlay, Table } from 'react-bootstrap';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  isNode
} from 'react-flow-renderer';
import dagre from 'dagre';
import { useHistory } from 'react-router-dom';

// import './layouting.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height

const nodeWidth = 200;
const nodeHeight = 33;
const getLayoutedElements = (elements, direction = 'LR') => {
  dagreGraph.setGraph({ rankdir: direction });
  // console.log("getLayoutedElements");
  // console.log(elements);
  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);



  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = 'left';
      el.sourcePosition = 'right';

      // unfortunately we need this little hack to pass a slighltiy different position
      // to notify react flow about the change. More over we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return el;
  });
};




const LayoutFlow = (props) => {
  let history = useHistory();
  const [contextMenu, setContextMenu] = useState({"x":null,"y":null,"display":false});
//   const { fitView } = useZoomPanHelper();
// console.log("LayoutFlow");  
// console.log(props.lineageArray);
    const layoutedElements = getLayoutedElements(props.lineageArray.lineage);
  const [elements, setElements] = useState(layoutedElements);
  const onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView({padding: 0.1, includeHiddenNodes: true});
  }
  const onNodeRightClick = (event, node) => {
    event.preventDefault();
    // console.log(event);
    // console.log(node.id);
    setContextMenu({"x":event.pageX,"y":event.pageY,"display":true,"target": event.target, "nodeID": node.id});
    // addToSelect(node.id);
  }

  const Backdrop = () => {
    return(
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.2)",
        zIndex: 1500
      }}
      onClick={() => setContextMenu({"x":null,"y":null,"display":false})}
      onContextMenu={() => setContextMenu({"x":null,"y":null,"display":false})}
      />
    )
  };

  const contextMenuDisplay = (contextMenu) => {
    if(contextMenu.display === false) return null;
    // console.log("Displaying Context Menu");
    // console.log(contextMenu);

    // console.log(contextMenu.target.firstChild.data);
    // console.log(contextMenu.target);
    // console.log(JSON.parse(contextMenu.target.dataset.selectvalue));
    // console.log(contextMenu.target.dataset.selectvalue.model);
    return(
      <div>
        <Overlay target={contextMenu.target} show={contextMenu.display} placement="right-start">
          <div style={{zIndex:1051}}>
            <Table bordered variant="dark">
              <tbody>
                <tr>
                  <td onClick={() => history.push("/catalog/"+contextMenu.nodeID)}>
                    Open Model in Current Tab
                  </td>
                </tr>
                <tr>
                  <td onClick={() => window.open('/catalog/'+contextMenu.nodeID)}>
                    Open Model in New Tab
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Overlay>
        <Backdrop show={contextMenu.display}/>
      </div>
    )
  }

  return (
    <div className="layoutflow lineagebox">
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          connectionLineType="smoothstep"
          onLoad={onLoad}
          onNodeContextMenu={onNodeRightClick}
          minZoom="0.1"
        >
            <MiniMap />
        </ReactFlow>
      </ReactFlowProvider>
      {contextMenuDisplay(contextMenu)}
    </div>
  );
};

export default LayoutFlow;

