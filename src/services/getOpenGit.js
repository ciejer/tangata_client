export async function getOpenGit(user) {
    const response = await fetch('/api/v1/open_git_connection', {headers: {Authorization: "Token " + user.token}});
    return await response;
}