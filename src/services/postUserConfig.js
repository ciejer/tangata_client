export async function postUserConfig(user, newConfig) {
    // console.log(newConfig);
    var configToSend = {...newConfig};
    delete configToSend._id;
    delete configToSend.email;
    delete configToSend.token;
    const response = await fetch('/api/v1/set_user_config', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: "Token " + user.token},
        body: JSON.stringify(configToSend)
    });
    return await response;
}