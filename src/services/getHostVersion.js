export async function getHostVersion(user) {
    const response = await fetch('/api/v1/get_host_version/', {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}