export async function getGenerateSSH(user) {
    const response = await fetch('/api/v1/generate_ssh', {headers: {Authorization: "Token " + user.token}});
    return await response;
}