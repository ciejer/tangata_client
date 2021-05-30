export async function getCheckDBTConnection(user) {
    // console.log(user);
    const response = await fetch('/api/v1/check_dbt_connection', {
        method: 'GET', 
        headers: {
                Authorization: "Token " + user.token
            }
    })
    return await response;
}