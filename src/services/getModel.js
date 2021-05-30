export async function getModel(modelNodeId, user) {
    const response = await fetch('/api/v1/models/' + modelNodeId, {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}