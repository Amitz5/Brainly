
export function random(len: number){
    let options = "qwertyuiopasdfghjklzxcvbnm12345678";
    let ans  = "";
    for(let i =0;i<len;i++){
        ans+=options[Math.floor(Math.random()* length)] // 0 => length
    }
    return ans;
}