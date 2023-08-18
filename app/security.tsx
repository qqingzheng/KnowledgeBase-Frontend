import { backEndBase } from "./config";

async function logIn(){
    const response = await fetch(
        backEndBase + "/security/get_access_token",
        {
            method: "POST",
        }
    );
    const data = await response.json();
    return data.access_token;
}