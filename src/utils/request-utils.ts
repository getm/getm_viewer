export const createGenericPostRequest = (apiUrl: string, contentType) => {
    const postRequest = (endpointUrl, args, callback?) => {

       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'POST',
           mode: 'cors',
           headers: { 'Content-Type': contentType },
           body: args
       });
   };
   return postRequest;
};

export const createPostRequest = (apiUrl: string) => {
   const postRequest = <T>(endpointUrl, args, callback?) => {

       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'POST',
           mode: 'cors',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(args)
       })
       .then(response => {
           if(!response.ok) {
               const json = response.json() as any;
               return json.catch(e => {
                   throw Error(response.statusText);
               })
               .then(e => {
                   throw Error(e.errorMessage);
               });
           } else {
               return response.json() as Promise<T>;
           };
       });
   };
   return postRequest;
};

export const createJsonToXmlRequest = (apiUrl: string) => {
   const postRequest = (endpointUrl: string, args) => {
       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'POST',
           mode: 'cors',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(args)
       })
       .then(response => {
           if(!response.ok) {
               const text = response.text() as any;
               return text.catch(e => {
                   throw Error(response.statusText);
               })
               .then(e => {
                   throw Error(e.errorMessage);
               });
           } else {
               return response.text() as Promise<string>;
           };
       });
   };
   return postRequest;
};

export const createXmlToJsonRequest = (apiUrl: string) => {
   const postRequest = <T>(endpointUrl: string, xmlRequest: string) => {
       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'POST',
           mode: 'cors',
           headers: { 'Content-Type': 'application/json' }, // notice '/json', this is a bug on the product server.
           body: xmlRequest
       })
       .then(response => {
           if(!response.ok) {
               const json = response.json() as any;
               return json.catch(e => {
                   throw Error(response.statusText);
               })
               .then(e => {
                   throw Error(e.errorMessage);
               });
           } else {
               return response.json() as Promise<T>;
           };
       });
   };
   return postRequest;
};

export const createXmlPostRequest = (apiUrl: string) => {
   const postRequest = (endpointUrl: string, xmlRequest: string) => {
       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'POST',
           mode: 'cors',
           headers: { 'Content-Type': 'application/xml' },
           body: xmlRequest
       })
       .then(response => {
           if(!response.ok) {
               const text = response.text() as any;
               return text.catch(e => {
                   throw Error(response.statusText);
               })
               .then(e => {
                   throw Error(e);
               });
           } else {
               return response.text() as Promise<string>;
           };
       });
   };
   return postRequest;
};

export const createGenericGetRequest = (apiUrl: string, contentType?: string) => {
   const getRequest = (endpointUrl) => {
       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'GET',
           mode: 'cors',
           headers: { 'Content-Type': contentType ? contentType : 'application/json' }
       });
   };
   return getRequest;
};

export const createGetRequest = (apiUrl: string, asText?: boolean) => {
   const getRequest = <T>(endpointUrl) => {

       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'GET',
           mode: 'cors',
           headers: { 'Content-Type': 'application/json' }
       })
       .then(response => {
           if(!response.ok) {
               throw Error(response.statusText);
           } else {
               return response.json() as Promise<T>;
           }
       });
   };

   return getRequest;
};

export const createGenericDeleteRequest = (apiUrl: string, contentType?: string) => {
   const deleteRequest = (endpointUrl) => {
       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'DELETE',
           mode: 'cors',
           headers: { 'Content-Type': contentType ? contentType : 'application/json' }
       });
   };
   return deleteRequest;
};

export const createDeleteRequest = (apiUrl: string, asText?: boolean) => {
   const deleteRequest = <T>(endpointUrl) => {

       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'DELETE',
           mode: 'cors',
           headers: { 'Content-Type': 'application/json' }
       })
       .then(response => {
           if(!response.ok) {
               throw Error(response.statusText);
           } else {
               return response.json() as Promise<T>;
           }
       });
   };

   return deleteRequest;
};

export const createGenericPutRequest = (apiUrl: string, contentType?: string) => {
   const putRequest = (endpointUrl, args, callback?) => {
       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'PUT',
           mode: 'cors',
           headers: { 'Content-Type': contentType ? contentType : 'application/json' },
           body: JSON.stringify(args)
       });
   };
   return putRequest;
};

export const createPutRequest = (apiUrl: string, asText?: boolean) => {
   const putRequest = <T>(endpointUrl, args, callback?) => {

       const fullUrl = apiUrl + endpointUrl;

       return fetch(fullUrl, {
           credentials: 'same-origin',
           method: 'PUT',
           mode: 'cors',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(args)
       })
       .then(response => {
           if(!response.ok) {
               throw Error(response.statusText);
           } else {
               return response.json() as Promise<T>;
           }
       });
   };

   return putRequest;
};

export const createParamString = (params: {}, toUpperCase?: boolean) => {
   let str = '?';
   Object.keys(params).forEach((key, index) => {
       const param = params[key];
       if(param === undefined || param === null) { return; }
       if(toUpperCase) { key = key.toUpperCase(); }
       str += key + '=' + param + '&';
   });
   return encodeURI(str.slice(0, str.length - 1));
};
