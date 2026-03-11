import { BASE_URL } from "@/config";



function fetchGet<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}/${path}`)
        .then(response => {
            if (!response.ok) {
                console.log("Response not OK: " + response);
                throw new Error(`${response.status}: ${response.statusText}`)
            }
            return response.json() as Promise<T>
        })
}

function fetchGetFile(path: string): Promise<Blob> {
    return fetch(`${BASE_URL}/${path}`)
        .then(response => {
            if (!response.ok) {
                console.log("Response not OK: " + response);
                throw new Error(`${response.status}: ${response.statusText}`)
            }
            return response.blob() as Promise<Blob>;
        })
}

function fetchPost<T>(path: string, bodyContent: string): Promise<T> {
    return fetch(
            `${BASE_URL}/${path}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: bodyContent
            }
        ).then(response => {
            if (!response.ok) {
                console.log("Response not OK: " + response);
                throw new Error(`${response.status}: ${response.statusText}`)
            }
            return response.json() as Promise<T>
        })
}

function fetchPostFile<T>(path: string, formData: FormData): Promise<T> {
    return fetch(
            `${BASE_URL}/${path}`,
            {
                method: 'POST',
                body: formData
            }
        ).then(response => {
            if (!response.ok) {
                console.log("Response not OK: " + response);
                throw new Error(`${response.status}: ${response.statusText}`)
            }
            return response.json() as Promise<T>
        })
}

function fetchDelete<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}/${path}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                console.log("Response not OK: " + response);
                throw new Error(`${response.status}: ${response.statusText}`)
            }
            return response.json() as Promise<T>
        })
}

export { fetchGet, fetchGetFile, fetchPost, fetchPostFile, fetchDelete };
