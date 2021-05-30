export async function refreshMetadata(user) {
    // console.log(user);
    const response = await fetch('/api/v1/refresh_metadata', {
        method: 'POST', 
        headers: {
                Authorization: "Token " + user.token
            }
    });
    return await response;
}