

function genPermissionConfig() {
    const fs =  require('fs');
//get pods where we must validate
    let pf = fs.readFileSync('./k8s/join/templates/quorum-permissioned-config.yaml.template').toString('utf8');
    let myenodesList = fs.readFileSync('../joindata/my-enodes.txt').toString('utf8');
    let myenodes = replaceAll(myenodesList,'[','');
    myenodes = replaceAll(myenodes,']','')
    myenodes = myenodes.trim().split('\n');
    for (let i = 0; i < myenodes.length; i++) {
        //sanitize
        let cv = replaceAll(myenodes[i],',','');
        cv = replaceAll(cv,'\t','').trim();
        myenodes[i] = cv;
        console.log(myenodes[i]);
    }

    let partnersenodesList = fs.readFileSync('../joindata/partners-enodes.txt').toString('utf8');
    let partnersenodes = replaceAll(partnersenodesList,'[','');
    partnersenodes = replaceAll(partnersenodes,']','')
    partnersenodes = partnersenodes.trim().split('\n');
    for (let i = 0; i < partnersenodes.length; i++) {
        //sanitize
        let cv = replaceAll(partnersenodes[i],',','');
        cv = replaceAll(cv,'\t','').trim();
        partnersenodes[i] = cv;
        console.log(partnersenodes[i])
    }


    let enodes = '';
    for (let i = 0; i < myenodes.length; i++){
        if (myenodes[i] === ''){
            continue;
        }
        const enode = '            '+ myenodes[i]+',\n'
        enodes += enode;
    }
    for (let i = 0; i < partnersenodes.length; i++){
        if (partnersenodes[i] === ''){
            continue;
        }
        const enode = '            '+ partnersenodes[i]+',\n';
        enodes += enode;
    }
    enodes = enodes.slice(0,enodes.length-2);
    //console.log(enodes);
    const  cfg = replaceAll(pf,"%ENODES_LIST%", enodes);
    fs.writeFileSync('./k8s/join/quorum-permissioned-config.yaml', cfg);
}


function replaceAll(src, str, withStr){
    return src.split(str).join(withStr);
}


module.exports = {
    genPermissionConfig
}
