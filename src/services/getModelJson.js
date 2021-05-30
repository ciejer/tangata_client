export async function getModelJson(modelJsonFilename, user) {
    const response = await fetch('/api/model_old/' + modelJsonFilename, {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}