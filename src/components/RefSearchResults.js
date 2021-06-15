import  ShowSearchResults  from './ShowSearchResults';
import {Component, createRef} from 'react';
import { getModelSearch } from '../services/getModelSearch';
import { getModel } from '../services/getModel';

export default class RefSearchResults extends Component {
    constructor(props) {
        super(props);
        this.state = {
          refSearchResults: {},
          refColumns: {},
          selectedModel: {}
        };
        this.refSearchBox = createRef();
      }
    debounceRefSearchResults(e) {
        var timeout = 1000;
        let timer;
        clearTimeout(timer);
        timer = setTimeout(() => {
            getModelSearch(this.refSearchBox.current.value, this.props.user)
            .then(response => {
            if(response.length===0 || response.error) {
                // this.setState({refSearchResults: {}});
                return null;
            }
            this.setState({refSearchResults: {"searchResults": response}});
            });
            }, timeout);
    }

    selectColumn = (column) => {
        this.props.selectModelColumn(this.state.selectedModel.modelName, column)
    }

    clearColumns = () => {
        this.setState({refColumns: {}});
    }

    CatalogColumns = () => {
        const columnRows = () => {
          return Object.entries(this.state.refColumns).map((value,index) => {
            return(
              <tr key={"columnRow"+value[0]} onClick={() => this.selectColumn(value[0])}>
                <td className="catalogColumnName">
                    {value[0].toLowerCase().replaceAll("_","_\u200b")}
                </td>
                <td className="catalogColumnType">
                    {value[1].type.toLowerCase()}
                </td>
                <td>
                    <div>
                        {value[1].description}
                    </div>
                </td>
              </tr>
            );
          });
        }
        if(Object.keys(this.state.refColumns).length > 0) { //if this has columns
          return(
            <div className="row mt-md-3">
              <div className="col">
                Choose Column:
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
                This model does not appear to contain any columns.
              </div>
            </div>
          );
        };
      }

    render() {
        if(Object.keys(this.state.refColumns).length === 0 && this.state.refSearchResults && this.state.refSearchResults.searchResults && this.state.refSearchResults.searchResults.results && this.state.refSearchResults.searchResults.results.length > 0) {
            var selectSearchResult = (e,index) => {
                getModel(this.state.refSearchResults.searchResults.results[index].nodeID, this.props.user)
                .then(response => {
                if(!response.error) {
                    this.setState({refColumns: response.columns, selectedModel: this.state.refSearchResults.searchResults.results[index]})
                }
                });
            }
            return(
                <div>
                    <input className="form-control mr-sm-2" type="search" ref={this.refSearchBox} onFocus={() => this.clearColumns()} onChange={(e) => this.debounceRefSearchResults(e)} placeholder="Search Models" aria-label="Search Models"/>
                    <ShowSearchResults
                        searchResults = {this.state.refSearchResults.searchResults}
                        resultSelectFunction = {selectSearchResult}
                    />
                </div>
            
            )
        } else if (Object.keys(this.state.refColumns).length > 0) {
            return(
                <div>
                    <input className="form-control mr-sm-2" type="search" ref={this.refSearchBox} onFocus={() => this.clearColumns()} onChange={(e) => this.debounceRefSearchResults(e)} placeholder="Search Models" aria-label="Search Models"/>
                    <this.CatalogColumns/>
                </div>
            
            )
        } else {
            return(
            <div>
                <input className="form-control mr-sm-2" type="search" ref={this.refSearchBox} onFocus={() => this.clearColumns()} onChange={(e) => this.debounceRefSearchResults(e)} placeholder="Search Models" aria-label="Search Models"/>
            </div>
            )
        }
    }
}

