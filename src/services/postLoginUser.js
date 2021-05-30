export async function postLoginUser(loginBody) {
    // console.log(loginBody);
    const response = await fetch('/api/v1/users/login', {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginBody)
    });
    return await response.json();
}