export async function getDBTree(user) {
    const response = await fetch('/api/v1/db_tree', {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}