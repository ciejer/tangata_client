/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  MiniMap,
  isNode,
  useZoomPanHelper
} from 'react-flow-renderer';
import dagre from 'dagre';


// import './layouting.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height

const nodeWidth = 200;
const nodeHeight = 33;
const getLayoutedElements = (elements, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
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
//   const { fitView } = useZoomPanHelper();
// console.log("LayoutFlow");  
// console.log(props.lineageArray);
    const layoutedElements = getLayoutedElements(props.lineageArray.lineage);
  const [elements, setElements] = useState(layoutedElements);
  const onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  }
  const onNodeRightClick = (event, node) => {
    event.preventDefault();
    // console.log(event);
    // console.log(node.id);
    props.selectModel(node.id);
  }
  return (
    <div className="layoutflow lineagebox">
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          connectionLineType="smoothstep"
          onLoad={onLoad}
          onNodeContextMenu={onNodeRightClick}
        >
            <MiniMap />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default LayoutFlow;

