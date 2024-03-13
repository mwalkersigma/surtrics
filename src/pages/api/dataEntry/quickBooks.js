import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import {parseBody} from "../../../modules/serverUtils/parseBody";
import { parse } from 'csv-parse/sync';


function formDataHandler(req) {
    let contentTypeHeader = req.headers['content-type'];
    let boundary = "--" + contentTypeHeader.split("; ")[1].replace("boundary=", "");
    let body = req.body;
    let parts = body.split(boundary)[1];
    console.log("here")

    let data = parts
        .split(/[\r\n]+/)
        .filter((part) => part.length)

    let fileName, file;

    data.forEach((val, index) => {
        if (val.includes("filename=")) {
            fileName = data[index].split("filename=")[1];
        }
        if (val.toLowerCase().includes("content-type")) {
            file = data.slice(index + 1);
        }
    });
    console.log("here")

    return parse(file.join("\n"), {
        columns: true,
        skip_empty_lines: true,
    });
}

async function postHandler(req, res) {
    return serverAdminWrapper(async (req,res,{user:{name}}    ) => {
        let records = formDataHandler(req, res);

        const queries = [];

        let pastRecordPoNumbers = await db.query(`
            SELECT po_number
            FROM surtrics.surplus_quickbooks_data
        `);
        console.log("here")
        pastRecordPoNumbers = pastRecordPoNumbers.rows.map((row) => row.po_number);

        let updateCount = 0;
        let insertCount = 0;

        records.forEach((record) => {
            const date = new Date(record['Date']);
            const po_number = record['PO Num'];
            const customerName = record['Name'].replace("'", "");
            const purchaseType = record['Purchase Type'];
            const total = record['Total Amount'].replace("$", "").replace(",", "");
            let query;

            if (pastRecordPoNumbers.includes(po_number)) {
                updateCount++;
                query = `
                    UPDATE surtrics.surplus_quickbooks_data
                    SET po_name = '${customerName}', po_date = '${date.toISOString()}', purchase_type = '${purchaseType}', purchase_total = '${total}', user_who_submitted = '${name}'
                    WHERE po_number = '${po_number}';
                `
            }else{
                insertCount++;
                query = `
                    INSERT INTO surtrics.surplus_quickbooks_data (po_name, po_number, po_date, purchase_type, purchase_total, user_who_submitted)
                    VALUES ('${customerName}', '${po_number}', '${date.toISOString()}', '${purchaseType}', '${total}', '${name}');
                `;
            }
            queries.push(query);
        })
        console.log("here")
        for(let i = 0; i < queries.length; i++) {
            console.log(queries[i])
            await db.query(queries[i]);
        }
        res.status(200).json({
            message: `Successfully added ${insertCount} records and updated ${updateCount} records.`
        });
    },"surplus director", "bsa")(req,res)
}
function putHandler(req, res) {
    let body = parseBody(req);
    const {
        customer_name,
        po_number,
        date_of_sale,
        purchase_type,
        total_amount,
        user_who_submitted,
    } = body;
    return db.query(`
       INSERT INTO surtrics.surplus_quickbooks_data (po_name, po_number, po_date, purchase_type, purchase_total, user_who_submitted)
         VALUES ($1, $2, $3, $4, $5, $6)
    `,[customer_name, po_number, date_of_sale, purchase_type, total_amount, user_who_submitted])
        .then(() => {
            res.status(200).json({message:"Successfully added data"});
        })
        .catch((error) => {
            res.status(500).json({error});
        });

}
function getHandler(req, res) {
    return serverAdminWrapper(async () => {
    return db.query(`
        SELECT * FROM surtrics.surplus_quickbooks_data
        --WHERE user_who_submitted = $1
    `,[
    //    name
    ])
    },"bsa","surplus director")(req,res)
        .then(({rows}) => {
            res.status(200).json(rows);
        })
        .catch((error) => {
            res.status(500).json({error});
        });
}

function deleteHandler(req, res) {
    return serverAdminWrapper((req,res)=> {
        return db.query(`
            DELETE
            FROM surtrics.surplus_quickbooks_data
            WHERE po_id = $1
        `, [parseBody(req)['po_id']])
            .then(() => {
                res.status(200).json("Successfully deleted data");
            })
            .catch((error) => {
                res.status(500).json(error);
            });
    },"bsa","surplus director")(req,res)

}

export default function handler (req, res) {
    return router({
        POST: postHandler,
        PUT: putHandler,
        GET: getHandler,
        DELETE: deleteHandler,
    })(req, res)
}