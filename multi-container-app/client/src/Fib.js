import React, {useEffect, useState} from 'react';
import axios from 'axios';

const Fib = () => {
    const [index, setIndex] = useState('');
    const [values, setValues] = useState({});
    const [seenIndices, setSeenIndices] = useState([]);



    useEffect(() => {
        async function fetchValues(){
            const values = await axios.get('/api/values/current');
            setValues({values: values.data});
        }
    
        async function fetchIndices() {
            const newIndices = await axios.get('/api/values/all');
            setSeenIndices([...newIndices]);
        }
         fetchValues();
         fetchIndices();
    });
}
