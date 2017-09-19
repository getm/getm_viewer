import { createPostRequest, createGetRequest, createPutRequest, createDeleteRequest} from 'src/utils/request-utils';
import ConfigurationUtil from 'src/utils/configuration-utils';

const dbAddress = ConfigurationUtil.getDatabaseAddress();

const postRequest = createPostRequest(dbAddress + '/api/rest');
const getRequest = createGetRequest(dbAddress  + '/api/rest/');
const putRequest = createPutRequest(dbAddress  + '/api/rest/');
const deleteRequest = createDeleteRequest(dbAddress  + '/api/rest/');

export class DatabaseInterface {
    public static getUserGroups(): Promise<string[]> {
        const url = 'user_groups/user';
        return getRequest(url).then((result: any) => Promise.resolve(result.groups as string[]));
    }
}
