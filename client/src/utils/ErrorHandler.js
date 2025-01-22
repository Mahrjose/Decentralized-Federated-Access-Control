import { toast } from 'react-hot-toast';

const handleAxiosError = (error) => {
    const errorMessage = error?.response?.data?.message || "An unexpected error occurred.";
    toast.error(errorMessage);
    console.error(error);
};

export default handleAxiosError;
