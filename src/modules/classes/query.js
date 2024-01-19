export default class Query {
    constructor(table,columns) {
        this.table = table;
        this.columns = columns;
        this.aggregateColumns = [];
        this.joins = [];
        this.where = [];
        this.whereChains = [];
        this.groupBy = [];
        this.orderBy = [];
        this.limit = [];
        this.params = [];
        this._query = "";
    }

    addAggregate(column,aggregate){
        this.aggregateColumns.push([aggregate,column]);
        return this;
    }
    addColumn(column){
        this.columns.push(column);
        return this;
    }

    addWhere(column,operator,value){
        this.where.push({column,operator,value});
        return this;
    }
    addWhereWithOr(conditions){
        this.whereChains.push(conditions);
        return this;
    }
    join(table,joinType,joinCondition){
        this.joins.push([table,joinType,joinCondition]);
        return this;
    }
    conditional = (condition,cbIfTrue,cbIfFalse) => {
        if(condition){
            cbIfTrue(this);
        }else{
            cbIfFalse(this);
        }
        return this;
    }
    addGroupBy(column){
        this.groupBy.push(column);
        return this;
    }
    addOrderBy(column,direction){
        this.orderBy.push({column,direction});
        return this;
    }
    addLimit(limit){
        this.limit.push(limit);
        return this;
    }
    build(){
        if(this._query) return this._query;
        let count = 1;

        let query = `SELECT ${this.columns.join(", ")} `;

        if(this.aggregateColumns.length > 0){
            query += `, ${this.aggregateColumns.map(([,column])=>`${column.replace("'@'",`$${count++}`)}`).join(", ")}`;
            this.params.push(...this.aggregateColumns.map(([aggregate])=>aggregate));
        }
        query += ` FROM ${this.table} `;
        if(this.joins.length > 0){
            query += ` ${this.joins.map(([table,joinType,joinCondition])=>`${joinType} JOIN ${table} ON ${joinCondition}`).join(" ")}`;
        }
        if(this.where.length > 0){
            query += `WHERE ${this.where.map(({column,operator,value})=>`${column} ${operator} $${count++}`).join(" AND ")}`;
            this.params.push(...this.where.map(({value})=>value));
            let whereChain = this.whereChains
                .map((conditions)=>`(${conditions.map(({column,operator,value})=>`${column} ${operator} $${count++}`).join(" OR ")})`).join(" AND ");

            if(whereChain.length > 0){
                query += ` AND ${whereChain}`;
                this.params = [...this.params, ...this.whereChains.map((conditions)=>conditions.map(({value})=>value)).flat()];
            }

        }
        if(this.groupBy.length > 0){
            query += ` GROUP BY ${this.groupBy.join(", ")}`;

        }
        if(this.orderBy.length > 0){
            query += ` ORDER BY ${this.orderBy.map(({column,direction})=>`${column} ${direction}`).join(", ")}`;

        }
        if(this.limit.length > 0){
            query += ` LIMIT ${this.limit.join(", ")}`;
        }
        query += `;`;
        this._query = query;
        return query;
    }

    get query(){
        return this.build();
    }

    getParsedQuery(){
        let query = this.build();
        let params = this.params;
        this.params.forEach((param,index)=>{
            query = query.replace(`$${index+1}`,`'${param}'`);
        })
        return query;
    }
}