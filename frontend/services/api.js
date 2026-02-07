// Centralized API service

const baseUrl = 'https://api.example.com';

export const fetchData = (endpoint) => {
    return fetch(`${baseUrl}/${endpoint}`).then(response => response.json());
};
