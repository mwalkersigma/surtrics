import router from "../../../../modules/serverUtils/requestRouter"
import Query from "../../../../modules/classes/query";
import db from "../../../../db/index";


async function getHandler(req, res) {
    const params = req.query;
    console.log(params)
    return await new Query('nfs.sursuite.quality_assurance', ['*'])
        .isNull('date_deleted')
        .conditional(params?.startDate,
            (query) => query.addWhere('audit_date', '>=', params.startDate),
            (query) => query
        )
        .conditional(params?.endDate,
            (query) => query.addWhere('audit_date', '<=', params.endDate),
            (query) => query
        )
        .run(db, console.log)
        .then(({rows}) => rows);
}

export default function handler(req, res) {
    return router({
            GET: getHandler,
    })(req, res)
        .then((response) => res.status(200).json(response))
        .catch((error) => res.status(500).json({error}));
}