export interface HttpResponse {
    status: number;
    statusCode: number;
    message: string;
    payload?: any;
    error?: string;
    description?: string;
    errors?: object;
}
