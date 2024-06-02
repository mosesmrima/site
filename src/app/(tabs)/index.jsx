import { Redirect } from 'expo-router';
import React, {useEffect} from 'react';
import {getAllPosts} from "../../features/posts/postsSlice";
import {useDispatch} from "react-redux";

const MainScreen = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(getAllPosts());
    }, []);
    return <Redirect href="/videos" />;
};

export default MainScreen;