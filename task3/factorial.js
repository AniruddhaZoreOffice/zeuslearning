
function factorial(n) {
    let arr = [1]
    if (n === 0 || n === 1) {
        return [1];
    }
    for (let i = 2; i <= n; i++) {
        let c = 0;
        for (let j = 0; j < arr.length; j++) {
            let product = arr[j] * i + c;
            arr[j] = product % 100000;
            c = Math.floor(product / 100000);
        } 
        while (c > 0) {
            arr.push(c % 100000);
            c = Math.floor(c / 100000);
        }
    }
    arr.reverse();
    return arr;
}


ans = factorial(100)
let str = ans[0].toString() + ans.slice(1).map((x) => x.toString().padStart(5,"0")).join("");
console.log(str)