export async function postFileUpload(uploadFormData, uploadType, user) {
    const response = await fetch('/api/v1/file_upload', {
        method: 'POST', 
        headers: {
            'Authorization': "Token " + user.token,
            'UploadType': uploadType
        },
        body: uploadFormData
    });
    return await response;
}