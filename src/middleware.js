import {NextResponse} from "next/server";



function disabledHandler() {
    return new NextResponse("Disabled", {
        status: 403,
        headers: {
            "x-middleware": "disabled"
        }
    })
}




export function middleware(req) {
    let {pathname} = req.nextUrl;
    console.log(req)
    switch (true) {
        case pathname.startsWith("/api/disabled"):
            return disabledHandler(req);
        default:
            return NextResponse.next();
    }
}

export const config = {
    matcher : ["/api/disabled","/admin/"]
}