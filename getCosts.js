const {parse} = require("csv-parse");
const fs = require("fs");
require('dotenv').config();
const {Pool} = require("pg");

const {CONNECTION_STRING} = process.env;


const pool = new Pool({
    connectionString:CONNECTION_STRING
});

const db = {
    query(text, params){
        return pool.query(text, params);
    },
};
class Query {
    constructor(table,columns) {
        this.table = table;
        this.columns = columns;
        this.offset = null;
        this.aggregateColumns = [];
        this.having = [];
        this.joins = [];
        this.where = [];
        this.whereChains = [];
        this.adHocWhere = null;
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
    addHaving(column,operator,value){
        this.having.push({column,operator,value});
        return this;
    }
    addWhereWithOr(conditions){
        this.whereChains.push(conditions);
        return this;
    }
    addAdHocWhere(condition){
        this.adHocWhere = condition
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
    addOffset(offset){
        this.offset = offset;
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

            query += ` WHERE ${this.where.map(({column,operator})=>`${column} ${operator} $${count++}`).join(" AND ")}`;
            this.params.push(...this.where.map(({value})=>value));
        }
        if(this.whereChains.length > 0) {
            if (this.params.length > 0) {
                query += ` AND ${this.whereChains
                    .map((conditions) => `(${conditions.map(({column, operator}) => `${column} ${operator} $${count++}`).join(" OR ")})`)
                    .join(" AND ")}`;
                this.params = [
                    ...this.params,
                    ...this.whereChains
                        .map((conditions) => conditions.map(({value}) => value))
                        .flat()
                ];
            }
            else {
                query += ` WHERE ${this.whereChains
                    .map((conditions) => `(${conditions.map(({column, operator}) => `${column} ${operator} $${count++}`).join(" OR ")})`)
                    .join(" AND ")}`;
                this.params = [
                    ...this.whereChains
                        .map((conditions) => conditions.map(({value}) => value))
                        .flat()
                ];
            }
        }

        if(this.adHocWhere && this.where.length === 0){
            query += ` ${this.adHocWhere}`;
        }
        if(this.groupBy.length > 0){
            query += ` GROUP BY ${this.groupBy.join(", ")}`;
        }
        if(this.having.length > 0){
            query += ` HAVING ${this.having.map(({column,operator})=>`${column} ${operator} $${count++}`).join(" AND ")}`;
            this.params.push(...this.having.map(({value})=>value));
        }
        if(this.orderBy.length > 0){
            query += ` ORDER BY ${this.orderBy.map(({column,direction})=>`${column} ${direction}`).join(", ")}`;
        }
        if(this.limit.length > 0){
            query += ` LIMIT ${this.limit.join(", ")}`;
        }
        if(this.offset){
            query += ` OFFSET ${Number(this.offset)}`;
        }
        query += `;`;
        this._query = query;
        return query;
    }
    get query(){
        return this.build();
    }
    log(value){
        console.log(value);
        return this;
    }
    getParsedQuery(){
        let query = this.build();
        this.params.forEach((param,index)=>{
            query = query
                .replace(`$${index+1}`,` ${isNaN(param) ? `'${param}'` : Number(param)} \n \t`)
        })
        let keywords = ['SELECT','FROM','WHERE','GROUP BY','HAVING','ORDER BY','LIMIT','OFFSET','LEFT JOIN','RIGHT JOIN','INNER JOIN'];
        query = query.replaceAll(',',`, \n \t`);
        keywords.forEach((keyword)=>{
            query = query.replaceAll(keyword,` \n ${keyword} \n \t `)
        })
        return query;
    }
    run(db,logger){
        return db.query(this.query,this.params)
    }
}

async function processCSV ( filePath,  callback ) {
    return new Promise((resolve, reject) =>{
        const parser = parse({
            delimiter: ",",
            relaxQuotes: true,
            relax_column_count: true,
            columns: true
        });
        fs.createReadStream(filePath, "utf8").pipe(parser);
        parser.on("readable", () => {
            let record;
            while (record = parser.read()) {
                callback(record);
            }
        });
        parser.on("end", () => {
            console.log("done");
            resolve()
        });
        parser.on("error", (err) => {
            reject(err);
        })
    })
}

(async () => {
    let data = {};
    let skusToProcess = [];
    await processCSV("./skuData.csv", async (record) => {
        const {SKU, NEW , NEW_OTHER, SELLER_REFURBISHED, USED, USED_EXCELLENT} = record;
        let potentialSkus = [NEW, NEW_OTHER, SELLER_REFURBISHED, USED, USED_EXCELLENT];
        let skusToFind = potentialSkus
            .filter(cost => cost !== "")
            .filter(cost => cost);
        skusToProcess.push(...skusToFind);
    })

    console.log(skusToProcess);

    await new Promise(async (res,rej)=>{
        for(let i = 0 ; i < skusToProcess.length; i++){
            let sku = skusToProcess[i];
            let query = new Query("sursuite.components",["cost"])
                .addWhere("sku","=",sku)
            let results = await query.run(db);
            data[sku] = results.rows[0]?.cost || 'No Cost Found';
        }
        res();
    })

    console.log(data);
    let csvString = "SKU,Cost\n";
    Object.entries(data).forEach(([sku,cost])=>{
        csvString += `${sku},${cost}\n`
    });
    fs.writeFileSync("costs.csv",csvString);




})()