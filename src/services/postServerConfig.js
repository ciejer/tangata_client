export async function postServerConfig(user, newConfig) {
    // console.log(newConfig);
    var configToSend = {...newConfig};
    const response = await fetch('/api/v1/set_server_config', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: "Token " + user.token},
        body: JSON.stringify(configToSend)
    });
    return await response;
}