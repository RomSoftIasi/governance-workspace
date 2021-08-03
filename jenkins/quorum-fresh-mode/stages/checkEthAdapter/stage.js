function check(){
    const http = require("http");

    const hostname="ref-eth-adapter";
    //const port=3000;
    const path="/check";
    const method="GET";
    const options = {
        hostname,
      //  port,
        path,
        method,
        headers : {
            'cache-control': 'no-cache'
        }
    };

    const req = http.request(options, function (res) {
        const chunks = [];

        console.log(res.statusCode);
        if (res.statusCode !== 200)
        {
            console.log("Failed to check the eth Adapter communication protocol.")
            process.exit(1);
        }
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            const body = Buffer.concat(chunks);
            const invokeResult = body.toString();
            console.log('Check received : ', invokeResult);
            if (invokeResult !== "\"0\""){
                console.log("Failed to check the eth Adapter communication protocol.")
                process.exit(1);
            }
        });
    });

    req.on('error', err => {
        console.log('Error : ',err);
        console.log("Failed to check the eth Adapter communication protocol.")
        process.exit(1);
    });
    req.end();
}


check();
