import router from "../../../modules/serverUtils/requestRouter";
import db from "../../../db/index"
import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import {parseBody} from "../../../modules/serverUtils/parseBody";

function index(req, res) {
    return serverAdminWrapper(() => {
        return db.query(`
            SELECT
                *
            FROM
                surtrics.ebay_defect_rate
        `)
    },"bsa","surplus director")(req,res)
        .then(({rows}) => rows)
}

function show(req, res) {
    return serverAdminWrapper((req, res,{user:{name}}) => {
        return db.query(`
            SELECT 
                * 
            FROM 
                surtrics.ebay_defect_rate
            WHERE
                user_who_entered = $1
        `,[name])
    },"bsa","surplus director")(req,res)
        .then(({rows}) => rows)
}

function putHandler(req, res) {
    return serverAdminWrapper((req, res,{user:{name}}) => {
        let body = parseBody(req);
        const {defectRate, date_for_week} = body;
        return db.query(`
            INSERT INTO surtrics.ebay_defect_rate (defect_rate, date_entered, user_who_entered)
            VALUES ($1, $2, $3)
        `, [defectRate, date_for_week, name])
    },"bsa","surplus director")(req,res)
        .then(({rows}) => rows)
}

function deleteHandler(req, res) {
    return serverAdminWrapper((req) => {
        return db.query(`
            DELETE
            FROM surtrics.ebay_defect_rate
            WHERE id = $1
        `, [parseBody(req)['id']])
    },"bsa","surplus director")(req,res)
        .then(({rows}) => rows)
}

function patchHandler(req,res){
    return serverAdminWrapper((req,res) => {
        const body = parseBody(req);
        const {id,field,value} = body;
        return db.query(`
            UPDATE surtrics.ebay_defect_rate
            SET ${field} = $1
            WHERE id = $2
        `,[value,id])
    },"bsa","surplus director")(req,res)
        .then(({rows}) => rows)
}

export default function handler (req, res) {
    return router({
        GET: index,
        POST : show,
        PUT: putHandler,
        PATCH: patchHandler,
        DELETE: deleteHandler,
    })(req, res)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => {
            res.status(500).json(error);
        });
}