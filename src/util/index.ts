import {RequestInfo, RequestInit} from 'node-fetch';

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({default: fetch}) => fetch(url, init));
import * as os from "os-utils";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getWebsiteContent = async (url: string, retries = 3): Promise<string> => {
  try {
    const headers = {
      "user-agent": " Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    }
    // Simple HTTP call
    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (err) {
    if (retries > 0) {
      //wait 2s and retry
      await sleep(2000);
      return getWebsiteContent(url, retries - 1);
    }
    throw err;
  }


}

export const getCPUUsageAsync = async (): Promise<number> => {
  return new Promise((resolve) => {
    os.cpuUsage((v) => {
      resolve(v);
    });
  });
}

export const getCPUFreeAsync = async (): Promise<number> => {
  return new Promise((resolve) => {
    os.cpuFree((v) => {
      resolve(v);
    });
  });
}


export const convertBytesToGB = (bytes: number): number => {
  return bytes / 1024 / 1024 / 1024;
}
