import {parseBody} from "./parseBody";

export default function parseRequestToQuery(baseQuery,dateField = 'date_for_week') {
    return (req)=> {
        let count = 0
        let params = [];

        let body = parseBody(req);
        let [select, from] = baseQuery.split('FROM');

        let footer = ``;

        if (body.timeScale && body.timeScale !== 'Data Points') {
            select += `,
            date_trunc($${++count},${dateField}) as ${dateField}
        `
            footer += `
            GROUP BY
                date_trunc($${count},${dateField})
            ORDER BY
                ${dateField} ASC
        `
            params.push(body.timeScale);
        } else {
            select += `,
            ${dateField}
        `
            footer += `
            GROUP BY
                ${dateField}
                ORDER BY
                ${dateField} ASC
                `
        }
        let query = select + "FROM" + from;


        if (body.startDate && body.endDate) {
            query += `WHERE ${dateField} BETWEEN $${++count} AND $${++count} \n`;
            params.push(body.startDate);
            params.push(body.endDate);
        }

        if (body.startDate && !body.endDate) {
            query += `WHERE ${dateField} >= $${++count} \n`;
            params.push(body.startDate);
        }

        if (!body.startDate && body.endDate) {
            query += `WHERE ${dateField} <= $${++count} \n`;
            params.push(body.endDate);
        }

        if (body.date) {
            query += `WHERE date_trunc('day',${dateField}) = $${++count} \n`;
            params.push(body.date);
        }

        query += footer;
        return [query, params]
    }
}