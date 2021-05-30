export async function postRegisterUser(registerBody) {
    // console.log(registerBody);
    const response = await fetch('/api/v1/users', {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerBody)
    });
    return await response.json();
}