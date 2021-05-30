import React from 'react'
const conditionConcat = (conditions) => {
    // console.log("SQLPanel Conditions");
    // console.log(conditions);
    if (conditions.length === 0) return null;
    var tempConditionConcat = conditions[0].fullName;
    for(var conditionIndex=1;conditionIndex<conditions.length;conditionIndex++) {
        tempConditionConcat += "\n  AND " + conditions[conditionIndex].fullName;
    }
    return tempConditionConcat;
}
const selectStatement = (state) => {
    var tempSelectStatement = "SELECT\n";
    const columnDefinition = (select) => {
        if('definition' in select) { // if SQL definition for column exists, use that
            return select.definition;
        } else { // otherwise use the column in inputColumns
            return select.inputColumns[0].model + "." + select.inputColumns[0].column;
        }
    }

    const selectLine = (select) => {
        return columnDefinition(select) + " AS " + select.alias;
    }

    if (state.selects.length !== 0) {
        tempSelectStatement += "  " + selectLine(state.selects[0]) + "\n"
        for(var selectIndex=1;selectIndex<state.selects.length;selectIndex++) {
            tempSelectStatement += "  , " 
                + selectLine(state.selects[selectIndex]) + "\n";
        }
    } else {
        tempSelectStatement += "  *\n"
    }
    return tempSelectStatement;
}

const fromStatement = (state) => {
    var tempFromStatement = "";

    const fromSyntax = (model) => {
        return "{{ ref(\"" + model.name + "\") }} AS " + model.name;
    }

    if (state.models.length !== 0) {
        tempFromStatement += "FROM " + fromSyntax(state.models.response.models[0]) + "\n"
        for(var joinIndex=1;joinIndex<state.models.response.models.length;joinIndex++) {
            tempFromStatement += "LEFT JOIN " 
                + fromSyntax(state.models.response.models[joinIndex])
                + "\n  ON " + conditionConcat(state.models.response.models[joinIndex].joinConditions) + "\n";
        }
    } else {
        tempFromStatement += "FROM " + state.outputModel
    }
    return tempFromStatement;
}
const whereStatement = (state) => {
    var tempWhereStatement = "";
    if (state.models.length !== 0) {
        tempWhereStatement += "WHERE " + state.conditions[0] + "\n"
        // console.log("Loading conditions");
        // console.log(state.conditions.length);
        for(var conditionIndex=1;conditionIndex<state.conditions.length;conditionIndex++) {
            tempWhereStatement += "  AND " + state.conditions[conditionIndex] + "\n";
        }
    } else {
        tempWhereStatement += "FROM " + state.outputModel
    }
    return tempWhereStatement;
}
export const SQLPanel = ({state}) => {
    // const fromItem = (joinModel) => {
    //     return(
    //         {join.}
    //     )
    // }
    return(
    <div>
        Generated SQL:
        <div className="sqlContent">
            {selectStatement(state)}
            {fromStatement(state)}
            {whereStatement(state)}
        </div>
    </div>
    )
}

