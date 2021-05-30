export async function getSSH(user) {
    const response = await fetch('/api/v1/get_ssh', {headers: {Authorization: "Token " + user.token}});
    return await response;
}