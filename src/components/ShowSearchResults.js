import {Row, Col } from 'react-bootstrap';
import {Component} from 'react';

export default class ShowSearchResults extends Component {
    render() {
        var searchResults = this.props.searchResults;
        
        if(searchResults.results.length>0) {
            searchResults.results = searchResults.results.sort(function demoteResults(firstEl, secondEl) {return Math.min(0,secondEl.promoteStatus)-Math.min(0,firstEl.promoteStatus)});
        }
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
            console.log(searchResult);

            function promoteIcon() {
                return(
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-patch-check" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                        <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z"/>
                    </svg>
                )
            }

            function demoteIcon() {
                return(
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-patch-exclamation" viewBox="0 0 16 16">
                        <path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0L7.1 4.995z"/>
                        <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z"/>
                    </svg>
                )
            }


            return (
                <div className={"row"+(searchResult.promoteStatus===1?" promote":(searchResult.promoteStatus===-1?" demote":""))} key={"searchRow"+index}>
                    <div className="col-sm">
                        <div className="container" onClick={(e) => resultSelectFunction(e, index)}>
                            <div className="row">
                                <div className="col font-weight-bold">
                                    {searchResult.modelName.toLowerCase()} {searchResult.promoteStatus===1?promoteIcon():(searchResult.promoteStatus===-1?demoteIcon():"")}
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

