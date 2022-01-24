import axios from 'axios';
import { HTTP422Error } from '../http/http.exception';

const API_KEY = process.env.API_KEY;

const getCoordinatesFromAddress = async (
    address: string
): Promise<{ lat: number; lng: number }> => {
    const URL = `https://geocode.search.hereapi.com/v1/geocode?q=${address}&apiKey=${API_KEY}`;

    const response = await axios.get(URL);
    const data = response.data;

    if (!data || data.items.length === 0) {
        const error = new HTTP422Error(
            'Could not find location for the specified address.'
        );

        throw error;
    }

    const coordinates = data.items[0].position;

    return coordinates;
};

export default getCoordinatesFromAddress;
