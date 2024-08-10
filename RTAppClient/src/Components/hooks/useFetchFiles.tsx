// src/hooks/useFetchFiles.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Root } from '../types/types';


const useFetchFiles = (url: string) => {
  const [rootData, setRootData] = useState<Root | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get<Root>(url); // Ensure the response matches the Root type
        setRootData(response.data);
      } catch (err : any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [url]);

  return { rootData, loading, error };
};

export default useFetchFiles;
