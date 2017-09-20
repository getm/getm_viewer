
import { createPostRequest } from "src/shared/utils/request-utils";
import ConfigurationUtil from "src/utils/configuration-utils";
import { SaveShapeArguments } from "src/interfaces/product-types";

const hostAddress = ConfigurationUtil.getBaseUrl();

const postRequest = createPostRequest(hostAddress + '/product/api/rest/');

export default class ProductInterface {

    public static saveShapes(args: SaveShapeArguments): Promise<string> {
        const url = 'save_shapes';
        return postRequest(url, args).then(response => response.result);
    }
    
}