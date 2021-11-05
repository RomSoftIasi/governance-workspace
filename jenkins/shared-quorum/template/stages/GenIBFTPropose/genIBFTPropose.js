
function genExecuteJoin(){

    const fs =  require('fs');
//get pods where we must validate
    let qPodslist = fs.readFileSync('./stages/GenIBFTPropose/nodes.txt').toString('utf8');
    const pods = qPodslist.trim().split('\n');
    console.log('no of pods : ', pods.length);
//get partners validators
    let pValidatorsList = fs.readFileSync('../joindata/partners-validators.txt').toString('utf8');
    const validators =  pValidatorsList.trim().split('\n');
    let cmds = '';
    for (let i = 0; i < pods.length; i++) {
        if (pods[i].trim() !== '')
        {
            console.log('Pod : ',pods[i]);
            for (let j = 0; j < validators.length; j++) {
                if (validators[j].trim() === '')
                {
                    continue;
                }
                //sanitize
                let cv = replaceAll(validators[j],',','');
                cv = replaceAll(cv,'\t','');
                cv = replaceAll(cv,'"','').trim();
                console.log ('exec on pod '+pods[i]+' for validator ',cv);
                const cmd = "kubectl exec "+pods[i]+" -c quorum -- sh -cx \"/etc/quorum/qdata/node-management/ibft_propose.sh '"+cv+"'\"";
                cmds += cmd + '\n';
            }
        }
        else {
            console.log('Skip Empty line.');
        }
    }


    fs.writeFileSync('./stages/GenIBFTPropose/execute-join.sh',cmds)
}


function replaceAll(src, str, withStr){
    return src.split(str).join(withStr);
}

module.exports = {
    genExecuteJoin
}
