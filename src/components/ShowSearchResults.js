import {Row, Col } from 'react-bootstrap';
import {Component} from 'react';

export default class ShowSearchResults extends Component {
    render() {
        var searchResults = this.props.searchResults;
        var resultSelectFunction = this.props.resultSelectFunction;
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
            // console.log(resultSelectFunction);
            return (
                <div className="row" key={"searchRow"+index}>
                    <div className="col-sm">
                        <div className="container" onClick={(e) => resultSelectFunction(e, index)}>
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
        var AllSearchRows = () => {
        // console.log(searchResults);
            if(searchResults.results.length===0) {
            return(
                <div className="container searchbox z-200">
                <Row>
                    <Col>
                    <h5 className="text-center">No search results</h5>
                    </Col>
                </Row>
                    
                </div>
            );
            }
            const allSearchRows = searchResults.results.map((searchResult, index) => searchRow(searchResult, index));
            return(
                    <div className="container searchbox z-200">
                    <Row>
                        <Col>
                        <h5 className="text-center">{searchResults.results.length} search results:</h5>
                        </Col>
                    </Row>
                        {allSearchRows}
                    </div>
            );
            
        }
        return(
            <div>
                <AllSearchRows/>
            </div>
        );
    }
}

