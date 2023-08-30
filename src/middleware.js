import {NextResponse} from "next/server";



function disabledHandler(req) {
    return new NextResponse({})
}


export function middleware(req) {

}

export const config = {
    matcher : ["/api/disabled"]
}