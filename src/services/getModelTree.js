export async function getModelTree(user) {
    const response = await fetch('/api/v1/model_tree', {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}