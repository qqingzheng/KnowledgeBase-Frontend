import { backEndBase } from "../config";

export function checkIfLogin(){
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      window.location.href = '/';
    }
}

export async function getUserInfo(){
  try {
    const response = await fetch(
      backEndBase + "/auth/get_info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem('access_token'),
        },
        
      }
    );
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw (null);
    }
  } catch (error) {
    return null;
  }
}

export async function getMyAppInfo(){
  try {
    const response = await fetch(
      backEndBase + "/auth/get_my_apps",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem('access_token'),
        },
      }
    );
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw (null);
    }
  } catch (error) {
    return null;
  }
}

export async function getAppInfo(app_id: string){
  try {
    const response = await fetch(
      backEndBase + "/auth/get_app_info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem('access_token'),
        },
        body: JSON.stringify({ app_id: app_id }),
      }
    );
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw (null);
    }
  } catch (error) {
    return null;
  }
}