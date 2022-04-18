

const BASE = "";
// const BASE = "http://127.0.0.1:5000";


export const POST = async (
        PATH, data,
        success_callback,
        failed_callback, header) => {

    let url = BASE + PATH , resp ;

    try{
        resp = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', ...(header || {})
            },
            body: JSON.stringify(data) }
        );

        if (resp.ok){
            resp.json().then((r) => {success_callback(r)})
        }
        else{
            failed_callback({status: -1, httpcode: resp.status, errormsg:  `application ${resp.status} http error code detected.`});
        }
    }
    catch {
        failed_callback({status: -1, httpcode: 500, errormsg:  `application 500 http error code detected.`});
    }

}


export async function GET (PATH, success_callback, failed_callback, headers, params) {

    let url = BASE + PATH;
    let resp ;

    if (params) {
        url += '?' + new URLSearchParams(params);
    }
    const _header = {"Content-Type": "application/json", ...(headers || {})}

    try{
        resp = await fetch(url, { headers: _header});
        if (resp.ok){

            resp.json().then((r) => {
                success_callback(r)}
            )
        }
        else{
            failed_callback({status: -1, httpcode: resp.status, errormsg:  `application ${resp.status} http error code detected.`});
        }
    }
    catch {
        failed_callback({status: -1, httpcode: 500, errormsg:  `application 500 http error code detected.`});
    }

}