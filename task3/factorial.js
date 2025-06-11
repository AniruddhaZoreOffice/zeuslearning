
function factorial(n) {
    let arr = [1]
    if (n === 0 || n === 1) {
        return [1];
    }
    for (let i = 2; i <= n; i++) {
        let carry = 0;
        for (let j = 0; j < arr.length; j++) {
            let product = arr[j] * i + carry;
            arr[j] = product % 10;
            carry = Math.floor(product / 10);
        } 
        while (carry > 0) {
            arr.push(carry % 10);
            carry = Math.floor(carry / 10);
        }
    }
    arr.reverse();
    return arr
    
}


console.log(factorial(1000))