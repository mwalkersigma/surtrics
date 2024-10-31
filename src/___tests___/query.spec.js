import Query from '../modules/classes/query';
import {beforeEach, describe, expect, test, vi} from "vitest";

describe('Query', () => {
    let query;

    beforeEach(() => {
        query = new Query('test_table', ['column1', 'column2']);
    });

    test('constructor', () => {
        expect(query.table).toBe('test_table');
        expect(query.columns).toEqual(['column1', 'column2']);
    });

    test('addAggregate', () => {
        query.addAggregate('column3', 'SUM');
        expect(query.aggregateColumns).toEqual([['SUM', 'column3']]);
    });

    test('addColumn', () => {
        query.addColumn('column3');
        expect(query.columns).toContain('column3');
    });

    test('addWhere', () => {
        query.addWhere('column1', '=', 'value1');
        expect(query.where).toEqual([{ column: 'column1', operator: '=', value: 'value1' }]);
    });

    test('addHaving', () => {
        query.addHaving('column1', '=', 'value1');
        expect(query.having).toEqual([{ column: 'column1', operator: '=', value: 'value1' }]);
    });

    test('addWhereWithOr', () => {
        query.addWhereWithOr([{ column: 'column1', operator: '=', value: 'value1' }]);
        expect(query.whereChains).toEqual([[{ column: 'column1', operator: '=', value: 'value1' }]]);
    });

    test('addAdHocWhere', () => {
        query.addAdHocWhere('column1=value1');
        expect(query.adHocWhere).toBe('WHERE column1=value1');
    });

    test('join', () => {
        query.join('table2', 'INNER', 'table2.id = test_table.id');
        expect(query.joins).toEqual([['table2', 'INNER', 'table2.id = test_table.id']]);
    });

    test('addGroupBy', () => {
        query.addGroupBy('column1');
        expect(query.groupBy).toContain('column1');
    });

    test('addOffset', () => {
        query.addOffset(10);
        expect(query.offset).toBe(10);
    });

    test('addOrderBy', () => {
        query.addOrderBy('column1', 'ASC');
        expect(query.orderBy).toEqual([{ column: 'column1', direction: 'ASC' }]);
    });

    test('addLimit', () => {
        query.addLimit(10);
        expect(query.limit).toEqual([10]);
    });

    test.each([
        [true, 1, 0],
        [false, 0, 1],
    ])('conditional', (condition, expectedTrue, expectedFalse) => {
        const cbIfTrue = vi.fn();
        const cbIfFalse = vi.fn();
        query.conditional(condition, cbIfTrue, cbIfFalse);
        expect(cbIfTrue).toHaveBeenCalledTimes(expectedTrue);
        expect(cbIfFalse).toHaveBeenCalledTimes(expectedFalse);
    });

    test('query', () => {
        query.addColumn('column3');
        query.addWhere('column1', '=', 'value1');
        const expectedSql = "SELECT column1, column2, column3 FROM test_table WHERE column1 = 'value1';";
        const result = query.getParsedQuery();
        // remove all white space, tabs, and new lines
        expect(result.replace(/\s/g, '')).toBe(expectedSql.replace(/\s/g, ''));
    });

    describe('Query Building',() => {

        test("It should build a simple query",()=>{
            let query = new Query("test_table",['column1','column2'])
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table ;");
        });
        test("It should build a query with a where clause",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1');
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1;");
        });
        test("It should build a query with a where clause and a having clause",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1')
                .addHaving('column2','=','value2');
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1 HAVING column2 = $2;");
        });
        test("It should build a query with a where clause and a having clause and a group by",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1')
                .addHaving('column2','=','value2')
                .addGroupBy('column1');
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1 GROUP BY column1 HAVING column2 = $2;");
        });
        test("It should build a query with a where clause and a having clause and a group by and an order by",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1')
                .addHaving('column2','=','value2')
                .addGroupBy('column1')
                .addOrderBy('column1','ASC');
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1 GROUP BY column1 HAVING column2 = $2 ORDER BY column1 ASC;");
        });
        test("It should build a query with a where clause and a having clause and a group by and an order by and a limit",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1')
                .addHaving('column2','=','value2')
                .addGroupBy('column1')
                .addOrderBy('column1','ASC')
                .addLimit(10);
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1 GROUP BY column1 HAVING column2 = $2 ORDER BY column1 ASC LIMIT 10;");
        });
        test("It should build a query with a where clause and a having clause and a group by and an order by and a limit and an offset",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1')
                .addHaving('column2','=','value2')
                .addGroupBy('column1')
                .addOrderBy('column1','ASC')
                .addLimit(10)
                .addOffset(5);
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1 GROUP BY column1 HAVING column2 = $2 ORDER BY column1 ASC LIMIT 10 OFFSET 5;");
        });
        test("It should build a query with a where clause and a having clause and a group by and an order by and a limit and an offset and a join",()=>{
            let query = new Query("test_table",['column1','column2'])
                .addWhere('column1','=','value1')
                .addHaving('column2','=','value2')
                .addGroupBy('column1')
                .addOrderBy('column1','ASC')
                .addLimit(10)
                .addOffset(5)
                .join('table2','INNER','table2.id = test_table.id');
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  INNER JOIN table2 ON table2.id = test_table.id WHERE column1 = $1 GROUP BY column1 HAVING column2 = $2 ORDER BY column1 ASC LIMIT 10 OFFSET 5;");
        });

        test('The add conditional method should call a call back function with the query as the first parameter',()=>{
            let query = new Query("test_table",['column1','column2'])
                .conditional(true,(q)=>q.addWhere('column1','=','value1'),()=>null);
            let result = query.build();
            expect(result).toBe("SELECT column1, column2  FROM test_table  WHERE column1 = $1;");
        })
        // Real World Examples
    })


    // Add more tests as needed for other methods and edge cases
});