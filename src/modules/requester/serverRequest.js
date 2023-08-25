export default class ServerRequest {
    constructor(limiter) {
        this.limiter = limiter;
        this._headers = null;
        this._body = null;
        this.method = 'GET';
    }

    set body(body) {
        if(!this._body){
            this._body = body;
        }else if (typeof this._body !== 'string') {
            this._body = {...this._body, ...body};
        }else{
            let oldBody = JSON.parse(this._body);
            let newBody = JSON.parse(body);
            this._body = JSON.stringify({...oldBody, ...newBody});
        }
    }
    get body() {
        return this._body;
    }


    set headers(headers) {
        let temp = headers
        if(this._headers) {
            temp = {...this._headers, ...headers}
        }
        this._headers = temp;
    }
    set header (header) {
        if(!this._headers) {
            this._headers = {};
        }
        this._headers[header.key] = header.value;
    }
    set method(method) {
        method = method.toUpperCase();
        if(method !== 'GET' && method !== 'POST' && method !== 'PUT' && method !== 'DELETE') {
            throw new Error('Invalid method');
        }
        this._method = method;
    }
    get method() {
        return this._method;
    }
    async executeRequest(url) {
        return this.limiter.schedule(() => {
            return fetch(url, {
                method: this.method,
                headers: this._headers,
                body: this.body
            })
        })
    }
}