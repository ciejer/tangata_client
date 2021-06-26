export async function getServerConfig(user) {
    const response = await fetch('/api/v1/get_server_config', {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}